import { mkdir, readFile, writeFile } from 'fs/promises'
import { installRootCA, loginToOs } from './actions/loginToOs'
import { startCliConfigYaml } from './fileModels/startCliConfig.yaml'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { mainMounts, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting OpenClaw Gateway!'))

  // Get the OS IP to construct the host URL
  const osIp = await sdk.getOsIp(effects)

  // Ensure .startos directory exists
  await mkdir(sdk.volumes.main.subpath('.startos'), { recursive: true })

  // Update start-cli config with host URL
  await startCliConfigYaml.merge(effects, { host: `https://${osIp}` })

  // Create subcontainer with volume mount for persistent data
  const openclawSub = await sdk.SubContainer.of(
    effects,
    { imageId: 'openclaw' },
    mainMounts(),
    'openclaw-sub',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('chown', {
      subcontainer: openclawSub,
      exec: {
        command: ['chown', '-R', 'node:node', '/data'],
      },
      requires: [],
    })
    .addDaemon('primary', {
      subcontainer: openclawSub,
      exec: {
        command: [
          'openclaw',
          'gateway',
          '--port',
          uiPort.toString(),
          '--bind',
          'lan',
          '--verbose',
          '--allow-unconfigured',
        ],
        env: {
          HOME: '/data',
          OPENCLAW_STATE_DIR: '/data/.openclaw',
        },
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkWebUrl(
            effects,
            `http://openclaw.startos:${uiPort}`,
            {
              successMessage: i18n('OpenClaw Gateway is ready'),
              errorMessage: i18n('OpenClaw Gateway is not ready'),
            },
          ),
        gracePeriod: 40_000,
      },
      requires: ['chown'],
    })
    .addOneshot('check-login', {
      subcontainer: openclawSub,
      exec: {
        fn: async (subcontainer) => {
          await installRootCA(effects, subcontainer)
          const result = await subcontainer.exec(
            ['start-cli', 'auth', 'session', 'list'],
            { user: 'root', env: { HOME: '/data' } },
          )
          if (result.exitCode !== 0) {
            await sdk.action.createOwnTask(effects, loginToOs, 'important', {
              reason: i18n(
                'Login to StartOS to enable start-cli authentication for managing the server',
              ),
            })
          }
          return null
        },
      },
      requires: ['primary'],
    })
    .addOneshot('server-state-snapshot', {
      subcontainer: openclawSub,
      exec: {
        fn: async (subcontainer) => {
          const execOpts = { user: 'root' as const, env: { HOME: '/data' } }
          const commands: [string, string[]][] = [
            ['Server Metrics', ['start-cli', 'server', 'metrics']],
            ['Server Time', ['start-cli', 'server', 'time']],
            ['Package List', ['start-cli', 'package', 'list']],
            ['Package Stats', ['start-cli', 'package', 'stats']],
            ['Notifications', ['start-cli', 'notification', 'list']],
            ['Tor Services', ['start-cli', 'net', 'tor', 'list-services']],
            ['Network Gateways', ['start-cli', 'net', 'gateway', 'list']],
            ['Disk List', ['start-cli', 'disk', 'list']],
            ['Backup Targets', ['start-cli', 'backup', 'target', 'list']],
          ]

          const sections: string[] = []
          for (const [label, cmd] of commands) {
            const result = await subcontainer.exec(cmd, execOpts)
            const output =
              result.exitCode === 0
                ? String(result.stdout).trim() || '_No output_'
                : `_Command failed (exit ${result.exitCode}): ${String(result.stderr).trim()}_`
            sections.push(`### ${label}\n\n\`\`\`\n${output}\n\`\`\``)
          }

          const stateBlock =
            '## Server State Snapshot\n\n' +
            `_Captured at startup: ${new Date().toISOString()}_\n\n` +
            sections.join('\n\n') +
            '\n'

          const memoryPath = sdk.volumes.main.subpath(
            '.openclaw/workspace/MEMORY.md',
          )
          const existing = await readFile(memoryPath, 'utf-8').catch(() => '')
          const marker = '## Server State Snapshot'
          const idx = existing.indexOf(marker)
          const before =
            idx >= 0 ? existing.slice(0, idx).trimEnd() : existing.trimEnd()
          const updated = before ? before + '\n\n' + stateBlock : stateBlock
          await writeFile(memoryPath, updated)

          return null
        },
      },
      requires: ['primary', 'check-login'],
    })
})
