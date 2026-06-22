import { sdk } from '../sdk'
import { openclawJson } from '../fileModels/openclaw.json'
import { mainMounts } from '../utils'
import { i18n } from '../i18n'

const { InputSpec, Value } = sdk

const dmPolicies = {
  allowlist: i18n('Allowlist (only allowed numbers)'),
  open: i18n('Open (anyone can DM)'),
}

const inputSpec = InputSpec.of({
  dmPolicy: Value.select({
    name: i18n('DM Policy'),
    description: i18n('How to handle direct messages from new users'),
    default: 'allowlist',
    values: dmPolicies,
  }),
  allowFrom: Value.text({
    name: i18n('Allowed Phone Numbers'),
    description: i18n(
      'Comma-separated phone numbers in international format (e.g. +15551234567,+15559876543). Only used with Allowlist policy.',
    ),
    required: false,
    default: null,
    masked: false,
    placeholder: '+15551234567,+15559876543',
  }),
})

export const connectWhatsapp = sdk.Action.withInput(
  'connect-whatsapp',

  async ({ effects }) => ({
    name: i18n('Connect WhatsApp'),
    description: i18n(
      'Connect WhatsApp so you can chat with your agent. Links your WhatsApp account via QR code.',
    ),
    warning: null,
    allowedStatuses: 'only-running',
    group: i18n('Channels'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const config = await openclawJson.read((c) => c).once()
    const whatsapp = config?.channels?.whatsapp

    return {
      dmPolicy: (whatsapp?.dmPolicy as 'allowlist') ?? 'allowlist',
      allowFrom: whatsapp?.allowFrom?.join(',') ?? '',
    }
  },

  async ({ effects, input }) => {
    const allowFromRaw: string = (input as any).allowFrom ?? ''
    const allowFrom = allowFromRaw
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean)

    await openclawJson.merge(effects, {
      channels: {
        whatsapp: {
          dmPolicy: input.dmPolicy,
          allowFrom,
        },
      },
    })

    // Run openclaw channels login to get the QR code for WhatsApp linking
    const result = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'openclaw' },
      mainMounts(),
      'whatsapp-login',
      async (subc) => {
        return subc.exec(['openclaw', 'channels', 'login'], {
          env: {
            HOME: '/data',
            OPENCLAW_STATE_DIR: '/data/.openclaw',
          },
        })
      },
    )

    const output = String(result.stdout || '').trim()
    const error = String(result.stderr || '').trim()

    if (result.exitCode !== 0) {
      throw new Error(
        i18n('WhatsApp login failed') +
          `: ${error || output || i18n('Unknown error')}`,
      )
    }

    return {
      version: '1',
      title: i18n('WhatsApp QR Code'),
      message: i18n(
        'Scan this QR code with WhatsApp (Settings > Linked Devices > Link a Device):',
      ),
      result: {
        value: output,
        copyable: false,
        masked: true,
        qr: true,
        type: 'single',
      },
    }
  },
)
