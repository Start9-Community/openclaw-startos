import { T, SubContainer } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { manifest } from '../manifest'
import { i18n } from '../i18n'
import { simplexJson } from '../fileModels/simplex.json'
import { openclawJson } from '../fileModels/openclaw.json'
import { mainMounts } from '../utils'
import {
  bridgeWsUrl,
  INBOUND_MOUNTPOINT,
  OUTBOUND_MOUNTPOINT,
  BRIDGE_OUTBOUND_DIR,
} from '../simplex'

const { InputSpec, Value, Variants } = sdk

// The minimum plugin version whose config schema accepts the file-exchange
// connection keys (filesFolder / outboundFolder / outboundFolderOnClient).
// Earlier versions reject them and OpenClaw fails to start, so enable installs
// at least this version before writing that config. `openclaw plugins install`
// rejects npm ranges, so the spec pins this exact version; the version-aware
// skip below still honors any newer build an operator installed out-of-band.
// Uninstall/list by id. `--force` overwrites a partial/older install.
const MIN_PLUGIN_VERSION = '1.8.0'
const SIMPLEX_PLUGIN_SPEC = `@dangoldbj/openclaw-simplex@${MIN_PLUGIN_VERSION}`
const SIMPLEX_PLUGIN_ID = 'openclaw-simplex'

// installed >= required, comparing numeric release components (prerelease/build
// suffixes ignored). Returns false when the version is missing/unparsable, so
// the caller falls through to (re)install rather than trusting an unknown.
function meetsMinVersion(
  installed: string | undefined,
  required: string,
): boolean {
  if (!installed) return false
  const parts = (v: string) =>
    v
      .split('-')[0]
      .split('.')
      .map((n) => Number.parseInt(n, 10) || 0)
  const a = parts(installed)
  const b = parts(required)
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const x = a[i] ?? 0
    const y = b[i] ?? 0
    if (x !== y) return x > y
  }
  return true
}

// Pull the installed openclaw-simplex version out of `plugins list --json`.
// Shape-tolerant (plugins may be a top-level array or under `.plugins`); returns
// undefined on any parse miss so the caller treats it as "needs install".
function installedPluginVersion(listStdout: string): string | undefined {
  try {
    const parsed = JSON.parse(listStdout || '{}')
    const plugins = Array.isArray(parsed) ? parsed : (parsed.plugins ?? [])
    const entry = plugins.find(
      (p: { id?: string }) => p?.id === SIMPLEX_PLUGIN_ID,
    )
    return entry?.version
  } catch {
    return undefined
  }
}

const CLI_ENV = { HOME: '/data', OPENCLAW_STATE_DIR: '/data/.openclaw' }

// Runs openclaw as `node` (uid 1000) so the installed plugin tree is node-owned
// and the node gateway loads it — a root-owned install is blocked by OpenClaw's
// ownership policy. The high timeout clears `subc.exec`'s 30s default, which
// would SIGKILL the npm download mid-flight (it resolves the large `openclaw`
// peer, and npm's own timeout is >=300s).
async function runOpenclawCli(
  effects: Parameters<Parameters<typeof sdk.Action.withInput>[3]>[0]['effects'],
  name: string,
  args: string[],
  timeoutMs = 600_000,
) {
  return sdk.SubContainer.withTemp(
    effects,
    { imageId: 'openclaw' },
    mainMounts(),
    name,
    async (subc) =>
      subc.exec(
        ['openclaw', ...args],
        { user: 'node', env: CLI_ENV },
        timeoutMs,
      ),
  )
}

/**
 * Read the installed plugin version, keeping "the probe failed" distinct from
 * "the plugin isn't installed". Both yield no version, but only the latter is
 * evidence about the plugin, so callers that act on absence must tell them apart.
 */
async function readInstalledPlugin(
  subcontainer: SubContainer<typeof manifest>,
): Promise<{ probed: boolean; version?: string }> {
  const list = await subcontainer.exec(
    ['openclaw', 'plugins', 'list', '--json'],
    { user: 'node', env: CLI_ENV },
  )
  if (list.exitCode !== 0) return { probed: false }
  return {
    probed: true,
    version: installedPluginVersion(String(list.stdout || '')),
  }
}

/**
 * Startup check: ask the user to submit Configure SimpleX when the channel is
 * enabled but the plugin is missing or behind MIN_PLUGIN_VERSION — the same
 * condition the action installs on.
 *
 * A package update can't re-run actions, so raising MIN_PLUGIN_VERSION in a
 * future release would otherwise leave the older plugin in place with no signal.
 * Raising the constant is all a future bump needs; this surfaces it. The task is
 * created only while the check fails, so one successful submit ends the prompt.
 *
 * `plugins list` is local (no network) and this runs after `primary`, so it
 * never delays startup or readiness.
 */
export async function requestSimplexPluginUpgrade(
  effects: T.Effects,
  subcontainer: SubContainer<typeof manifest>,
): Promise<null> {
  if (!(await simplexJson.read((c) => c).once())?.enabled) return null

  // A failed probe says nothing about the plugin, so stay quiet rather than
  // raise a task the user can't clear by acting on it. A successful probe that
  // reports no version does mean the plugin is absent, which the action fixes.
  const { probed, version } = await readInstalledPlugin(subcontainer)
  if (!probed) return null
  if (version && meetsMinVersion(version, MIN_PLUGIN_VERSION)) return null

  await sdk.action.createOwnTask(effects, configureSimplex, 'important', {
    reason: i18n('Submit Configure SimpleX to upgrade the SimpleX plugin'),
  })
  return null
}

/**
 * Bring `plugins` policy to what a real install would have left: the plugin
 * enabled, and named in `allow` when a restrictive allowlist exists. Mirrors
 * OpenClaw's own semantics — an absent/empty `allow` means unrestricted loading,
 * so we must not create a list (that would newly restrict every other plugin).
 * No-ops when policy is already correct, so a plain re-submit stays cheap.
 */
async function repairPluginPolicy(
  effects: Parameters<Parameters<typeof sdk.Action.withInput>[3]>[0]['effects'],
) {
  const plugins = await openclawJson.read((c) => c?.plugins).once()
  const allow = plugins?.allow
  const needsAllow =
    Array.isArray(allow) &&
    allow.length > 0 &&
    !allow.includes(SIMPLEX_PLUGIN_ID)
  const needsEnable = plugins?.entries?.[SIMPLEX_PLUGIN_ID]?.enabled !== true
  if (!needsAllow && !needsEnable) return

  await openclawJson.merge(effects, {
    plugins: {
      // Whole-array write: the file model's merge replaces arrays rather than
      // appending, so hand it the full authored order plus our id.
      ...(needsAllow
        ? { allow: [...(allow as string[]), SIMPLEX_PLUGIN_ID] }
        : {}),
      entries: { [SIMPLEX_PLUGIN_ID]: { enabled: true } },
    },
  })

  // Config is now correct, but OpenClaw also keeps a persisted registry snapshot
  // of plugin policy. Rebuild it so `plugins list` and the next load agree with
  // what we just wrote. Best-effort: the restart below reloads regardless.
  try {
    const refresh = await runOpenclawCli(effects, 'simplex-plugin-registry', [
      'plugins',
      'registry',
      '--refresh',
    ])
    if (refresh.exitCode !== 0) {
      console.warn(
        `Could not refresh the plugin registry: exit ${refresh.exitCode}`,
      )
    }
  } catch (err) {
    console.warn(
      `Could not refresh the plugin registry: ${(err as Error).message}`,
    )
  }
}

const inputSpec = InputSpec.of({
  channel: Value.union({
    name: i18n('Enable SimpleX Channel'),
    description: i18n(
      'Install the openclaw-simplex plugin and configure it to use the SimpleX Websocket Bridge service. Note: installation may take a few minutes.',
    ),
    default: 'disabled',
    variants: Variants.of({
      disabled: { name: i18n('Disabled'), spec: InputSpec.of({}) },
      enabled: {
        name: i18n('Enabled'),
        spec: InputSpec.of({
          dmPolicy: Value.select({
            name: i18n('DM Policy'),
            description: i18n('How to handle direct messages from new users'),
            default: 'pairing',
            values: {
              pairing: i18n('Pairing (approve code on first contact)'),
              open: i18n('Open (anyone can DM)'),
            },
          }),
        }),
      },
    }),
  }),
})

export const configureSimplex = sdk.Action.withInput(
  'configure-simplex',
  async () => ({
    name: i18n('Configure SimpleX'),
    description: i18n(
      'Enable the SimpleX channel and configure how it handles direct messages.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Channels'),
    visibility: 'enabled',
  }),
  inputSpec,
  async ({ effects }) => {
    const enabled = !!(await simplexJson.read((c) => c).const(effects))?.enabled
    const dmPolicy = await openclawJson
      .read((c) => c?.channels?.['openclaw-simplex']?.dmPolicy)
      .const(effects)
    if (enabled) {
      const policy: 'pairing' | 'open' =
        dmPolicy === 'open' ? 'open' : 'pairing'
      return {
        channel: { selection: 'enabled' as const, value: { dmPolicy: policy } },
      }
    }
    return { channel: { selection: 'disabled' as const, value: {} } }
  },
  async ({ effects, input }) => {
    if (input.channel.selection === 'enabled') {
      const { dmPolicy } = input.channel.value

      // The bridge's control WebSocket, resolved over the LXC bridge. Fail early
      // with a clear message if it isn't reachable (bridge not installed/running).
      const wsUrl = await bridgeWsUrl(effects)
      if (!wsUrl) {
        throw new Error(
          i18n(
            'The SimpleX Websocket Bridge is not reachable on the internal network. Make sure it is installed and running, then try again.',
          ),
        )
      }

      // Skip the install only when a new-enough plugin is already present.
      // `plugins list` is local-only (no network); `install` shells out to npm.
      // Checking the version (not just presence) means a pinned bump actually
      // upgrades an older install, and "allow later" avoids downgrading a newer
      // one an operator installed out-of-band. Missing/unparsable → install.
      const list = await runOpenclawCli(effects, 'simplex-plugin-list', [
        'plugins',
        'list',
        '--json',
      ])
      const installed =
        list.exitCode === 0
          ? installedPluginVersion(String(list.stdout || ''))
          : undefined

      if (!meetsMinVersion(installed, MIN_PLUGIN_VERSION)) {
        const install = await runOpenclawCli(
          effects,
          'simplex-plugin-install',
          ['plugins', 'install', SIMPLEX_PLUGIN_SPEC, '--force'],
        )
        if (install.exitCode !== 0) {
          const out = (
            String(install.stderr || '') + String(install.stdout || '')
          ).trim()
          const detail = out ? out.slice(-400) : i18n('Unknown error')
          throw new Error(
            i18n('Could not install the SimpleX plugin') + `: ${detail}`,
          )
        }
      } else {
        // `plugins install` is what enables the plugin and adds it to a
        // restrictive allowlist, so skipping it leaves an installed-but-unloaded
        // plugin whenever that policy is missing (fresh box that installed the
        // plugin out-of-band, hand-edited config, leftovers from a disable).
        // Repair it here instead of reinstalling: config is the canonical owner,
        // and this costs no network round trip.
        await repairPluginPolicy(effects)
      }

      // Point OpenClaw's SimpleX channel at the bridge and wire file exchange to
      // the bridge's mounted dirs. filesFolder / outboundFolder are OpenClaw's
      // mountpoints of the bridge's files/outbound; outboundFolderOnClient is the
      // same outbound dir as seen inside the bridge's container, so the plugin can
      // rewrite the path it sends. Safe to write here because a plugin >=
      // MIN_PLUGIN_VERSION (which accepts these keys) is guaranteed installed above.
      await openclawJson.merge(effects, {
        channels: {
          'openclaw-simplex': {
            enabled: true,
            dmPolicy,
            connection: {
              allowUnsafeRemoteWs: true,
              wsUrl,
              filesFolder: INBOUND_MOUNTPOINT,
              outboundFolder: OUTBOUND_MOUNTPOINT,
              outboundFolderOnClient: BRIDGE_OUTBOUND_DIR,
            },
          },
        },
      })

      await simplexJson.write(effects, { enabled: true })

      const status = await sdk.getStatus(effects).once()
      if (status?.started) await effects.restart()

      return null
    }

    // Disable in reverse order: drop the load-bearing StartOS state before the
    // best-effort plugin uninstall.
    await simplexJson.write(effects, { enabled: false })

    const cfg = await openclawJson.read((c) => c).once()
    if (cfg?.channels && 'openclaw-simplex' in cfg.channels) {
      const channels = { ...cfg.channels }
      delete (channels as Record<string, unknown>)['openclaw-simplex']
      await openclawJson.write(effects, { ...cfg, channels })
    }

    try {
      await runOpenclawCli(effects, 'simplex-plugin-uninstall', [
        'plugins',
        'uninstall',
        SIMPLEX_PLUGIN_ID,
        '--force',
      ])
    } catch (err) {
      console.warn(
        i18n('Could not uninstall the SimpleX plugin: ').concat(
          (err as Error).message,
        ),
      )
    }

    const status = await sdk.getStatus(effects).once()
    if (status?.started) await effects.restart()

    return null
  },
)
