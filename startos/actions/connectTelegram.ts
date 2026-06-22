import { sdk } from '../sdk'
import { openclawJson } from '../fileModels/openclaw.json'
import { i18n } from '../i18n'

const { InputSpec, Value } = sdk

const dmPolicies = {
  pairing: i18n('Pairing (approve code on first contact)'),
  open: i18n('Open (anyone can DM)'),
}

const inputSpec = InputSpec.of({
  botToken: Value.text({
    name: i18n('Bot Token'),
    description: i18n(
      'Telegram bot token from @BotFather. Create a bot at https://t.me/BotFather and copy the token.',
    ),
    required: true,
    default: null,
    masked: true,
    placeholder: '123456789:ABCdefGHIjklMNOpqrSTUvwxYZ',
  }),
  dmPolicy: Value.select({
    name: i18n('DM Policy'),
    description: i18n('How to handle direct messages from new users'),
    default: 'pairing',
    values: dmPolicies,
  }),
})

export const connectTelegram = sdk.Action.withInput(
  'connect-telegram',

  async ({ effects }) => ({
    name: i18n('Connect Telegram'),
    description: i18n(
      'Connect a Telegram bot so you can chat with your agent from Telegram. Create a bot with @BotFather first.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: i18n('Channels'),
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => {
    const config = await openclawJson.read((c) => c).once()
    const telegram = config?.channels?.telegram

    return {
      botToken: telegram?.botToken ?? '',
      dmPolicy: (telegram?.dmPolicy as 'pairing') ?? 'pairing',
    }
  },

  async ({ effects, input }) => {
    await openclawJson.merge(effects, {
      channels: {
        telegram: {
          enabled: true,
          botToken: input.botToken,
          dmPolicy: input.dmPolicy,
        },
      },
    })

    return {
      version: '1' as const,
      title: i18n('Telegram Connected'),
      message: i18n(
        'Telegram bot configured. Restart the service for changes to take effect. DM your bot to start chatting with your agent.',
      ),
      result: null,
    }
  },
)
