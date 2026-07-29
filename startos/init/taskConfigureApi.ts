import { sdk } from '../sdk'
import { authProfilesJson } from '../fileModels/authProfiles.json'
import { configureApiCredentials } from '../actions/configureApiCredentials'
import { i18n } from '../i18n'

export const taskConfigureApi = sdk.setupOnInit(async (effects, kind) => {
  const hasCredentials = await authProfilesJson
    .read((p) => Object.keys(p?.profiles ?? {}).length > 0)
    .once()

  if (!hasCredentials) {
    await sdk.action.createOwnTask(
      effects,
      configureApiCredentials,
      'critical',
      {
        reason: i18n('Configure your AI provider credentials to use OpenClaw'),
      },
    )
  }
})
