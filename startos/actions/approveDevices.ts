import { sdk } from '../sdk'
import { runOpenclawCli } from '../utils'
import { i18n } from '../i18n'

type PendingDevice = {
  requestId: string
  deviceId: string
  displayName?: string
  platform?: string
  browserOrigin?: string
  remoteIp?: string
  role?: string
}

export const approveDevices = sdk.Action.withoutInput(
  'approve-devices',

  async () => ({
    name: i18n('Approve Browser Pairing'),
    description: i18n(
      'Approve every browser waiting to pair with the Web UI. Log in to the Web UI first; it says "pairing required" until this runs.',
    ),
    warning: i18n(
      'Only run this right after you tried to log in yourself: every pending request is approved, and an approved browser keeps its access until you remove it in the Web UI.',
    ),
    allowedStatuses: 'only-running',
    group: null,
    visibility: 'enabled',
  }),

  async ({ effects }) => {
    const list = await runOpenclawCli(effects, 'devices-list', [
      'devices',
      'list',
      '--json',
    ])
    if (list.exitCode !== 0) {
      throw new Error(
        `${i18n('Could not read pairing requests')}: ${String(list.stderr || list.stdout).trim()}`,
      )
    }
    const pending: PendingDevice[] = JSON.parse(String(list.stdout)).pending

    if (pending.length === 0) {
      return {
        version: '1',
        title: i18n('Nothing to approve'),
        message: i18n(
          'No browser is waiting to pair. Open the Web UI, log in with the gateway password, then run this action.',
        ),
        result: null,
      }
    }

    const approved: string[] = []
    for (const request of pending) {
      const result = await runOpenclawCli(effects, 'devices-approve', [
        'devices',
        'approve',
        request.requestId,
      ])
      if (result.exitCode !== 0) {
        throw new Error(
          `${i18n('Could not approve pairing request')} ${request.requestId}: ${String(result.stderr || result.stdout).trim()}`,
        )
      }
      approved.push(
        [
          request.displayName ?? request.deviceId,
          request.platform,
          request.browserOrigin,
          request.remoteIp,
        ]
          .filter(Boolean)
          .join(' · '),
      )
    }

    return {
      version: '1',
      title: i18n('Pairing approved'),
      message: i18n(
        'The Web UI reconnects on its own; reload it if it does not.',
      ),
      result: {
        type: 'multiline',
        name: i18n('Approved'),
        description: null,
        value: approved.join('\n'),
        copyable: false,
        qr: false,
        masked: false,
      },
    }
  },
)
