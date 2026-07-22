import { T } from '@start9labs/start-sdk'
import { simplexJson } from './fileModels/simplex.json'
import { mainMounts } from './utils'

/**
 * Optional SimpleX Websocket Bridge integration.
 *
 * When enabled (via the Configure SimpleX action / simplex.json), OpenClaw
 * exchanges files with the SimpleX Websocket Bridge package through dependency
 * volume mounts, following that package's file-exchange contract:
 *
 *   inbound  — the bridge's received-files dir (`.simplex/files`), read-only;
 *              the bridge reports received files by name, resolved here.
 *   outbound — the bridge's outgoing dir (`.simplex/outbound`), read-write;
 *              OpenClaw writes a file here and sends the bridge-side path
 *              (`/data/.simplex/outbound/<name>`).
 *
 * The bridge itself is driven over its published Websocket. This module only
 * wires the dependency + mounts; the plugin/channel config comes later.
 */

export const SIMPLEX_BRIDGE_ID = 'simplex-websocket-bridge'

// Where the bridge's file-exchange dirs are mounted inside the OpenClaw
// container. Arbitrary paths — the openclaw-simplex plugin is pointed at these
// by the Connect SimpleX action (connection.filesFolder / outboundFolder).
export const INBOUND_MOUNTPOINT = '/media/simplex/files'
export const OUTBOUND_MOUNTPOINT = '/media/simplex/outbound'

// The outbound dir as seen INSIDE the bridge's own container. On send the plugin
// rewrites its outbound path prefix to this so simplex-chat can resolve the file
// (connection.outboundFolderOnClient). Contract with the bridge package.
export const BRIDGE_OUTBOUND_DIR = '/data/.simplex/outbound'

/** Enabled flag, reactive (re-runs the caller when it changes). */
function enabledReactive(effects: T.Effects): Promise<boolean> {
  return simplexJson
    .read((c) => c)
    .const(effects)
    .then((s) => !!s?.enabled)
}

/** Enabled flag, one-shot (does not subscribe the caller to changes). */
function enabledOnce(): Promise<boolean> {
  return simplexJson
    .read((c) => c)
    .once()
    .then((s) => !!s?.enabled)
}

/**
 * Dependency fragment for setupDependencies: require the bridge running (gated
 * on its `websocket` health check) when the integration is enabled. Reactive,
 * so toggling the flag updates the dependency graph without a manual trigger.
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
 * Append the bridge's file-exchange mounts when the integration is enabled.
 * Read once (non-reactive): main computes mounts at start, so toggling the flag
 * takes effect on the next (re)start rather than restarting the gateway live.
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
