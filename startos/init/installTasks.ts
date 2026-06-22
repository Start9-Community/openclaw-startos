import { mkdir } from 'fs/promises'
import { defaultAgentId } from '../fileModels/authProfiles.json'
import { sdk } from '../sdk'

export const installTasks = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  // Create the directory structure OpenClaw expects on first install. Login to
  // StartOS is NOT created here: it grants root-equivalent access and is
  // optional, so main.ts surfaces it (as an important task) only once the
  // gateway is up and start-cli is found unauthenticated.
  await mkdir(
    sdk.volumes.main.subpath(`.openclaw/agents/${defaultAgentId}/agent`),
    { recursive: true },
  )
  await mkdir(sdk.volumes.main.subpath('.openclaw/credentials'), {
    recursive: true,
  })
})
