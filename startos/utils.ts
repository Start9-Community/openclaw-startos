import { T, z } from '@start9labs/start-sdk'
import * as fs from 'node:fs/promises'
import { sdk } from './sdk'

export const uiPort = 18789

// start-cli release whose binary the image installs (see UPDATING.md).
export const START_CLI_VERSION = '1.1.0'

export function mainMounts() {
  return sdk.Mounts.of().mountVolume({
    volumeId: 'main',
    subpath: null,
    mountpoint: '/data',
    readonly: false,
  })
}

// Doctor budgets 30s of integrity scans per database before it migrates anything.
export const DOCTOR_TIMEOUT_MS = 1_800_000

export const OPENCLAW_CLI_ENV = {
  HOME: '/data',
  OPENCLAW_STATE_DIR: '/data/.openclaw',
}

// `node` because OpenClaw refuses state and plugins the gateway's uid does not
// own; the timeout clears `exec`'s 30s SIGKILL default.
export async function runOpenclawCli(
  effects: T.Effects,
  name: string,
  args: string[],
  timeoutMs = 600_000,
) {
  return sdk.SubContainer.withTemp(
    effects,
    { imageId: 'openclaw' },
    mainMounts(),
    name,
    (subc) =>
      subc.exec(
        ['openclaw', ...args],
        { user: 'node', env: OPENCLAW_CLI_ENV },
        timeoutMs,
      ),
  )
}

const credentialsSchema = z.object({ apiKey: z.string() })

/**
 * Read the API key a dependency publishes on its `public` volume (e.g. vLLM's
 * `credentials.json`). Mounts that volume into a transient subcontainer via
 * `Mounts.mountDependency` — reading a dependency's volume needs no volume of
 * our own. Returns null if unavailable (dependency not installed/running, file
 * missing, or no key).
 */
export async function readDependencyApiKey(
  effects: T.Effects,
  dependencyId: string,
): Promise<string | null> {
  try {
    return await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'openclaw' },
      sdk.Mounts.of().mountDependency({
        dependencyId,
        volumeId: 'public',
        subpath: 'credentials.json',
        mountpoint: '/credentials.json',
        type: 'file',
        readonly: true,
      }),
      `${dependencyId}-creds`,
      async (sub) => {
        const raw = await fs.readFile(sub.subpath('/credentials.json'), 'utf8')
        return credentialsSchema.parse(JSON.parse(raw)).apiKey
      },
    )
  } catch {
    return null
  }
}

// Sent verbatim as the heartbeat turn's user message; scratch is appended when set.
export const HEARTBEAT_PROMPT = `Refresh the 3 most dynamic subsections of the Server State Snapshot in MEMORY.md. Run these commands, then update **only** the corresponding subsections below \`## Server State Snapshot\`. Preserve all other subsections and content in MEMORY.md.

1. \`start-cli server metrics\` — update \`### Server Metrics\`
2. \`start-cli package list\` — update \`### Package List\`
3. \`start-cli notification list\` — update \`### Notifications\`

Update the timestamp line to \`_Captured at heartbeat: <current timestamp>_\`.

Follow the heartbeat monitor scratch context when provided. When done, reply NO_REPLY.`
