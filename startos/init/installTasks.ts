import { mkdir } from 'fs/promises'
import { loginToOs } from '../actions/loginToOs'
import { defaultAgentId } from '../fileModels/authProfiles.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const installTasks = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return

  // Create required directory structure for openclaw
  await mkdir(
    sdk.volumes.main.subpath(`.openclaw/agents/${defaultAgentId}/agent`),
    { recursive: true },
  )
  await mkdir(sdk.volumes.main.subpath('.openclaw/credentials'), {
    recursive: true,
  })

  await sdk.action.createOwnTask(effects, loginToOs, 'critical', {
    reason: i18n('Login to StartOS to enable start-cli authentication'),
  })
})
