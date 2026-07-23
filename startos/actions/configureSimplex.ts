import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { simplexJson } from '../fileModels/simplex.json'
import { openclawJson } from '../fileModels/openclaw.json'
import { mainMounts } from '../utils'
import { bridgeWsUrl } from '../simplex'

const { InputSpec, Value, Variants } = sdk

// The published npm package and the plugin id it installs as. Install by spec
// (latest), uninstall by id; `--force` makes re-enabling idempotent.
const SIMPLEX_PLUGIN_SPEC = '@dangoldbj/openclaw-simplex'
const SIMPLEX_PLUGIN_ID = 'openclaw-simplex'

// `subc.exec`'s default 30s timeout SIGKILLs the plugin install mid-download
// (it also resolves the large `openclaw` peer from npm). npm's own timeout is
// >=300s, so go above that.
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

      // Skip the install when the plugin is already present (`plugins install`
      // shells out to npm; re-running is wasteful. `plugins list` is local-only).
      const list = await runOpenclawCli(effects, 'simplex-plugin-list', [
        'plugins',
        'list',
        '--json',
      ])
      const alreadyInstalled =
        list.exitCode === 0 &&
        String(list.stdout || '').includes(SIMPLEX_PLUGIN_ID)

      if (!alreadyInstalled) {
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
      }

      // File-exchange wiring (connection.filesFolder / outboundFolder /
      // outboundFolderOnClient) is omitted until @dangoldbj/openclaw-simplex
      // publishes the release that adds those keys — the current 1.7.3 schema
      // rejects them and OpenClaw fails to start.
      await openclawJson.merge(effects, {
        channels: {
          'openclaw-simplex': {
            enabled: true,
            dmPolicy,
            connection: {
              allowUnsafeRemoteWs: true,
              wsUrl,
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
