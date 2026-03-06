import { sdk } from '../sdk'
import { createBotUser } from 'synapse-startos/startos/actions/createBotUser'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  username: Value.text({
    name: 'Bot Username',
    description:
      'The localpart for the bot user on Synapse (e.g. "openclaw" creates @openclaw:your.domain)',
    required: true,
    default: 'openclaw',
    placeholder: 'openclaw',
    masked: false,
  }),
  password: Value.text({
    name: 'Bot Password',
    description: 'The password for the bot user account on Synapse',
    required: true,
    default: null,
    placeholder: null,
    masked: true,
  }),
})

export const configureSynapse = sdk.Action.withInput(
  'configure-synapse',

  async ({ effects }) => ({
    name: 'Configure Synapse',
    description:
      'Create a bot user on your Synapse homeserver for OpenClaw to use as a Matrix messaging channel.',
    warning: null,
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => ({
    username: 'openclaw',
    password: '',
  }),

  async ({ effects, input }) => {
    await sdk.action.createTask(effects, 'synapse', createBotUser, 'critical', {
      input: {
        kind: 'partial',
        value: {
          username: input.username,
          password: input.password,
        },
      },
      reason: 'OpenClaw needs a bot user on Synapse for Matrix messaging',
      replayId: 'openclaw-create-bot-user',
    })
  },
)
