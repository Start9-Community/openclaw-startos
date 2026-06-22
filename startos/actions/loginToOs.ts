import { sdk } from '../sdk'
import { startCliConfigYaml } from '../fileModels/startCliConfig.yaml'
import { mainMounts } from '../utils'
import { SubContainer } from '@start9labs/start-sdk'
import { appendFile } from 'fs/promises'
import { T } from '@start9labs/start-sdk'
import { i18n } from '../i18n'

const { InputSpec, Value } = sdk

const inputSpec = InputSpec.of({
  masterPassword: Value.text({
    name: i18n('StartOS Master Password'),
    description: i18n('Your StartOS server master password'),
    required: true,
    default: null,
    placeholder: i18n('Enter master password'),
    masked: true,
  }),
})

export const loginToOs = sdk.Action.withInput(
  'login-to-os',

  async ({ effects }) => ({
    name: i18n('Login to StartOS'),
    description: i18n('Authenticate start-cli with your StartOS server'),
    warning: i18n(
      'This will give root access to your StartOS server to this package. Only do this for a server designated for development purposes.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  async ({ effects }) => ({ masterPassword: '' }),

  async ({ effects, input }) => {
    // Get the host URL from config
    const config = await startCliConfigYaml.read((c) => c).once()
    const host = config?.host

    if (!host) {
      throw new Error(
        i18n(
          'No host configured. The host URL is set automatically from the OS IP address.',
        ),
      )
    }

    // Run start-cli login command
    const result = await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'openclaw' },
      mainMounts(),
      'start-cli-login',
      async (subc) => {
        await installRootCA(effects, subc)
        return subc.exec(['start-cli', 'auth', 'login'], {
          user: 'root',
          env: { HOME: '/data', PASSWORD: input.masterPassword },
        })
      },
    )

    if (result.exitCode !== 0) {
      throw new Error(
        i18n('Login failed') +
          `: ${result.stderr || result.stdout || i18n('Unknown error')}`,
      )
    }

    return {
      version: '1' as const,
      title: i18n('Login Successful'),
      message: i18n('start-cli is now authenticated with your StartOS server.'),
      result: null,
    }
  },
)

export async function installRootCA(
  effects: T.Effects,
  subcontainer: SubContainer<typeof sdk.manifest>,
) {
  const hostnames = [`${sdk.manifest.id}.startos`]
  const certs = await sdk.getSslCertificate(effects, hostnames).const()
  const [rootCa] = certs.slice(-1)

  await subcontainer.writeFile(
    '/usr/share/ca-certificates/startos-root-ca.crt',
    rootCa,
  )
  await appendFile(
    `${subcontainer.rootfs}/etc/ca-certificates.conf`,
    'startos-root-ca.crt\n',
  )

  // Install StartOS root CA to system trust store
  await subcontainer.execFail(['update-ca-certificates'], { user: 'root' })
}
