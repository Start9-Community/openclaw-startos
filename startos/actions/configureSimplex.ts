import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { simplexJson } from '../fileModels/simplex.json'
import { openclawJson } from '../fileModels/openclaw.json'
import { mainMounts } from '../utils'
import { SIMPLEX_BRIDGE_ID } from '../simplex'

const { InputSpec, Value, Variants } = sdk

// The published npm package and the plugin id it installs as. Install by spec
// (latest), uninstall by id. Unpinned so `openclaw plugins update` tracks the
// latest published plugin; `--force` makes re-enabling idempotent.
const SIMPLEX_PLUGIN_SPEC = '@dangoldbj/openclaw-simplex'
const SIMPLEX_PLUGIN_ID = 'openclaw-simplex'

// Same-box control endpoint for the bridge. StartOS gives every package a
// `<id>.startos` internal hostname; same-box dependents reach the bridge's
// container directly (port 5225), bypassing the reverse-proxy bearer gate, so
// no token is needed. `allowUnsafeRemoteWs` silences the plugin's non-loopback
// plaintext-ws warning — the LXC network is trusted.
const BRIDGE_WS_URL = `ws://${SIMPLEX_BRIDGE_ID}.startos:5225`

// `subc.exec`'s default timeout is 30s, which SIGKILLs a plugin install
// mid-download (installing the plugin also resolves the large `openclaw` peer
// from npm — well over 30s). npm's own internal install timeout is >=300s, so
// we go above that.
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
        { env: { HOME: '/data', OPENCLAW_STATE_DIR: '/data/.openclaw' } },
        timeoutMs,
      ),
  )
}

// Enabling reveals the DM policy. A plain toggle can't conditionally show a
// sibling field in start-sdk, so the enable control is a Disabled/Enabled union
// whose Enabled variant carries the DM policy (same idiom as configureApiCredentials).
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
      const policy: 'pairing' | 'open' = dmPolicy === 'open' ? 'open' : 'pairing'
      return {
        channel: { selection: 'enabled' as const, value: { dmPolicy: policy } },
      }
    }
    return { channel: { selection: 'disabled' as const, value: {} } }
  },
  async ({ effects, input }) => {
    if (input.channel.selection === 'enabled') {
      const { dmPolicy } = input.channel.value

      // Skip the install when the plugin is already present. `plugins install`
      // shells out to npm (needs registry network); re-running is wasteful and
      // can trip over prior partial state. `plugins list` is local-only.
      const list = await runOpenclawCli(effects, 'simplex-plugin-list', [
        'plugins',
        'list',
        '--json',
      ])
      const alreadyInstalled =
        list.exitCode === 0 && String(list.stdout || '').includes(SIMPLEX_PLUGIN_ID)

      if (!alreadyInstalled) {
        const install = await runOpenclawCli(effects, 'simplex-plugin-install', [
          'plugins',
          'install',
          SIMPLEX_PLUGIN_SPEC,
          '--force',
        ])
        if (install.exitCode !== 0) {
          const out = (
            String(install.stderr || '') + String(install.stdout || '')
          ).trim()
          const detail = out ? out.slice(-400) : i18n('Unknown error')
          throw new Error(i18n('Could not install the SimpleX plugin') + `: ${detail}`)
        }
      }

      // Point OpenClaw's SimpleX channel at the bridge (same-box, token-free).
      //
      // File-exchange wiring (connection.filesFolder / outboundFolder /
      // outboundFolderOnClient) is intentionally omitted until
      // @dangoldbj/openclaw-simplex publishes the release that adds those
      // connection keys — the currently published 1.7.3 schema rejects them and
      // OpenClaw fails to start. When that release lands: pin SIMPLEX_PLUGIN_SPEC
      // to it, then add filesFolder: INBOUND_MOUNTPOINT,
      // outboundFolder: OUTBOUND_MOUNTPOINT,
      // outboundFolderOnClient: BRIDGE_OUTBOUND_DIR (import them from '../simplex').
      await openclawJson.merge(effects, {
        channels: {
          'openclaw-simplex': {
            enabled: true,
            dmPolicy,
            connection: {
              allowUnsafeRemoteWs: true,
              wsUrl: BRIDGE_WS_URL,
            },
          },
        },
      })

      // StartOS-side flag: requires the bridge dependency and mounts its
      // file-exchange dirs at start (ready for when file exchange is wired up).
      await simplexJson.write(effects, { enabled: true })

      const status = await sdk.getStatus(effects).once()
      if (status?.started) await effects.restart()

      // Success needs no dialog; a failed install already throws above.
      return null
    }

    // Disable in the reverse order of enable, so the load-bearing state is torn
    // down BEFORE the best-effort plugin uninstall — if the uninstall fails, the
    // bridge dependency is already dropped and the config already removed.

    // 1) Drop the StartOS flag → setDependencies stops requiring the bridge and
    //    main.ts stops mounting its dirs on the next start.
    await simplexJson.write(effects, { enabled: false })

    // 2) Remove the SimpleX channel from OpenClaw's config.
    const cfg = await openclawJson.read((c) => c).once()
    if (cfg?.channels && 'openclaw-simplex' in cfg.channels) {
      const channels = { ...cfg.channels }
      delete (channels as Record<string, unknown>)['openclaw-simplex']
      await openclawJson.write(effects, { ...cfg, channels })
    }

    // 3) Best-effort uninstall the plugin — last, and non-fatal.
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

    // Success needs no dialog.
    return null
  },
)
