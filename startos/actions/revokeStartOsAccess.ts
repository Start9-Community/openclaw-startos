import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { mainMounts } from '../utils'
import { installRootCA } from './loginToOs'

// start-cli stores its identity key next to its config (<HOME>/.startos/config.yaml);
// loginToOs runs `start-cli auth login` with HOME=/data, so the key lands here.
// `developer.key.pem` and the `.cookies.json` pair are the pre-1.1.0 names, kept
// so an upgraded install has nothing left behind.
const startCliAuthPaths = [
  '/data/.startos/id.key.pem',
  '/data/.startos/developer.key.pem',
  '/data/.startos/.cookies.json',
  '/data/.startos/.cookies.json.tmp',
]

export const revokeStartOsAccess = sdk.Action.withoutInput(
  'revoke-startos-access',

  async ({ effects }) => ({
    name: i18n('Revoke StartOS Access'),
    description: i18n(
      "Remove OpenClaw's stored start-cli authentication so it can no longer administer this StartOS server",
    ),
    warning: i18n(
      'OpenClaw will lose StartOS administrative access until you run Login to StartOS again.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    await sdk.SubContainer.withTemp(
      effects,
      { imageId: 'openclaw' },
      mainMounts(),
      'start-cli-revoke',
      async (subc) => {
        // Login enrolls the key in the server's key store, which is what
        // `auth session list` reads, so deleting the file alone strands an
        // unnamed entry there. `auth logout` un-enrolls it, and has to run
        // first because the request is signed with the key it de-registers.
        // Deleting the key is the part that actually revokes access, so it
        // stays unconditional — an unreachable host, a missing CA, or an
        // already-revoked key can't be allowed to block it.
        try {
          await installRootCA(effects, subc)
          await subc.exec(['start-cli', 'auth', 'logout'], {
            user: 'node',
            env: { HOME: '/data' },
          })
        } catch (e) {
          console.warn(
            'Server-side un-enrollment failed; removing the key anyway',
          )
          console.warn(String(e))
        }

        await subc.execFail(['rm', '-f', ...startCliAuthPaths], {
          user: 'root',
        })
      },
    )

    return {
      version: '1' as const,
      title: i18n('StartOS Access Revoked'),
      message: i18n(
        "OpenClaw's stored start-cli authentication was removed. Run Login to StartOS to grant access again.",
      ),
      result: null,
    }
  },
)
