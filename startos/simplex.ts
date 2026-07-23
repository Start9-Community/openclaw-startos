import { T } from '@start9labs/start-sdk'
import { sdk } from './sdk'
import { simplexJson } from './fileModels/simplex.json'
import { mainMounts } from './utils'

// Optional SimpleX Websocket Bridge integration: wires the dependency + file
// mounts (following the bridge's file-exchange contract) and resolves its
// control WebSocket. The plugin/channel config lives in configureSimplex.ts.

export const SIMPLEX_BRIDGE_ID = 'simplex-websocket-bridge'

// Where the bridge's file-exchange dirs are mounted inside the OpenClaw
// container; the openclaw-simplex plugin is pointed at these.
export const INBOUND_MOUNTPOINT = '/media/simplex/files'
export const OUTBOUND_MOUNTPOINT = '/media/simplex/outbound'
// The outbound dir as seen inside the bridge's own container (plugin rewrites
// its outbound prefix to this so simplex-chat can resolve the file).
export const BRIDGE_OUTBOUND_DIR = '/data/.simplex/outbound'

// The bridge exports its control WebSocket as interface `ws` on host `main`
// (port 5225, scheme ws). Resolve it over the LXC bridge — the retired
// `<pkg>.startos` DNS no longer resolves between containers (same pattern as
// configureApiCredentials).
const BRIDGE_WS_HOST_ID = 'main'
const BRIDGE_WS_INTERFACE_ID = 'ws'

/** `ws://<bridge-ip>:5225`, or undefined if the bridge isn't reachable. */
export function bridgeWsUrl(effects: T.Effects): Promise<string | undefined> {
  return sdk.host
    .get(
      effects,
      { hostId: BRIDGE_WS_HOST_ID, packageId: SIMPLEX_BRIDGE_ID },
      (host) => {
        const iface =
          host &&
          Object.values(host.bindings)
            .flatMap((b) => Object.values(b.interfaces))
            .find((i) => i.id === BRIDGE_WS_INTERFACE_ID)
        return iface
          ? iface.addressInfo
              .filter({ kind: 'bridge', predicate: (h) => !h.ssl })
              .format('urlstring')[0]
          : undefined
      },
    )
    .once()
}

function enabledReactive(effects: T.Effects): Promise<boolean> {
  return simplexJson
    .read((c) => c)
    .const(effects)
    .then((s) => !!s?.enabled)
}

function enabledOnce(): Promise<boolean> {
  return simplexJson
    .read((c) => c)
    .once()
    .then((s) => !!s?.enabled)
}

/**
 * Dependency fragment for setupDependencies: require the bridge running (gated
 * on its `websocket` health check) when the integration is enabled. Reactive.
 */
export async function simplexDependencies(effects: T.Effects) {
  return (await enabledReactive(effects))
    ? {
        [SIMPLEX_BRIDGE_ID]: {
          kind: 'running' as const,
          healthChecks: ['websocket'],
          versionRange: '>=0.3.0:0',
        },
      }
    : {}
}

/**
 * Append the bridge's file-exchange mounts when enabled. Read once
 * (non-reactive): main computes mounts at start, so toggling takes effect on
 * the next start rather than restarting the gateway live.
 */
export async function withSimplexMounts(
  effects: T.Effects,
  mounts: ReturnType<typeof mainMounts>,
): Promise<ReturnType<typeof mainMounts>> {
  if (!(await enabledOnce())) return mounts

  return mounts
    .mountDependency({
      dependencyId: SIMPLEX_BRIDGE_ID,
      volumeId: 'main',
      subpath: '.simplex/files',
      mountpoint: INBOUND_MOUNTPOINT,
      readonly: true,
    })
    .mountDependency({
      dependencyId: SIMPLEX_BRIDGE_ID,
      volumeId: 'main',
      subpath: '.simplex/outbound',
      mountpoint: OUTBOUND_MOUNTPOINT,
      readonly: false,
    })
}
