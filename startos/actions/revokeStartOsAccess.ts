import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { mainMounts } from '../utils'

// start-cli stores its auth cookie next to its config (<HOME>/.startos/config.yaml);
// loginToOs runs `start-cli auth login` with HOME=/data, so the cookie lands here.
const startCliCookiePaths = [
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
        await subc.execFail(['rm', '-f', ...startCliCookiePaths], {
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
