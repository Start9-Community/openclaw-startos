import { mkdir } from 'fs/promises'
import { loginToOs } from '../actions/loginToOs'
import { defaultAgentId } from '../fileModels/authProfiles.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const installTasks = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  // Create the directory structure OpenClaw expects on first install.
  await mkdir(
    sdk.volumes.main.subpath(`.openclaw/agents/${defaultAgentId}/agent`),
    { recursive: true },
  )
  await mkdir(sdk.volumes.main.subpath('.openclaw/credentials'), {
    recursive: true,
  })

  // Optional, and raised only here, so it never returns once dismissed.
  await sdk.action.createOwnTask(effects, loginToOs, 'optional', {
    reason: i18n(
      'Optionally authenticate start-cli so OpenClaw can administer this server',
    ),
  })
})
