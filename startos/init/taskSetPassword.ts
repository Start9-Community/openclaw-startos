import { setPassword } from '../actions/setPassword'
import { openclawJson } from '../fileModels/openclaw.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const taskSetPassword = sdk.setupOnInit(async (effects) => {
  const hasPassword = await openclawJson
    .read((c) => c.gateway.auth.password)
    .const(effects)

  if (!hasPassword) {
    await sdk.action.createOwnTask(effects, setPassword, 'critical', {
      reason: i18n('Set your OpenClaw gateway password'),
    })
  }
})
