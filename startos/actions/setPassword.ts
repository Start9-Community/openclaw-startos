import { utils } from '@start9labs/start-sdk'
import { openclawJson } from '../fileModels/openclaw.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const setPassword = sdk.Action.withoutInput(
  'set-password',

  async ({ effects }) => {
    const hasPass = !!(await openclawJson
      .read((c) => c.gateway.auth.password)
      .const(effects))

    return {
      name: hasPass ? i18n('Reset Password') : i18n('Set Password'),
      description: hasPass
        ? i18n('Reset your OpenClaw gateway password')
        : i18n(
            'Set the gateway password needed to log in to the Control UI',
          ),
      warning: null,
      allowedStatuses: 'any',
      group: null,
      visibility: 'enabled',
    }
  },

  async ({ effects }) => {
    const password = utils.getDefaultString({
      charset: 'a-z,A-Z,1-9,!,@,$,%,&,*',
      len: 22,
    })

    await openclawJson.merge(effects, {
      gateway: { auth: { password } },
    })

    return {
      version: '1' as const,
      title: i18n('Password Set'),
      message: i18n(
        'Use this password to log in to the OpenClaw Control UI.',
      ),
      result: {
        type: 'single' as const,
        value: password,
        copyable: true,
        masked: true,
        qr: false,
      },
    }
  },
)
