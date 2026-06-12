import { mkdir } from 'fs/promises'
import { openclawJson } from '../fileModels/openclaw.json'
import { startCliConfigYaml } from '../fileModels/startCliConfig.yaml'
import { sdk } from '../sdk'
import { mainMounts } from '../utils'

export const initializeService = sdk.setupOnInit(async (effects, kind) => {
  // Get the OS IP and set url to startos/config.yaml
  const osIp = await sdk.getOsIp(effects)
  const hostUrl = `https://${osIp}`

  await mkdir(sdk.volumes.main.subpath('.startos'), { recursive: true })

  await startCliConfigYaml.merge(effects, { host: hostUrl })

  // Seed workspace bootstrap files only when missing, so user edits survive upgrades
  await mkdir(sdk.volumes.main.subpath('.openclaw/workspace/memory'), {
    recursive: true,
  })
  await sdk.SubContainer.withTemp(
    effects,
    { imageId: 'openclaw' },
    mainMounts(),
    'copy-soul',
    async (subc) => {
      for (const file of [
        'SOUL.md',
        'IDENTITY.md',
        'HEARTBEAT.md',
        'MEMORY.md',
      ]) {
        await subc.execFail(
          [
            'sh',
            '-c',
            `test -f /data/.openclaw/workspace/${file} || cp /opt/workspace/${file} /data/.openclaw/workspace/${file}`,
          ],
          { user: 'root' },
        )
      }
    },
  )

  // Always enforce the gateway settings the StartOS proxy requires (OpenClaw reads
  // the JSON directly); deep-merge leaves the user's password and other keys intact.
  await openclawJson.merge(effects, {
    gateway: {
      auth: { mode: 'password' },
      controlUi: {
        enabled: true,
        allowInsecureAuth: true,
        dangerouslyAllowHostHeaderOriginFallback: true,
        dangerouslyDisableDeviceAuth: true,
      },
    },
  })

  // Ensure the bundled skills dir stays on the load path without dropping user-added dirs
  const config = await openclawJson.read((c) => c).once()
  const extraDirs = config?.skills?.load?.extraDirs ?? []
  if (!extraDirs.includes('/opt/skills')) {
    await openclawJson.merge(effects, {
      skills: { load: { extraDirs: [...extraDirs, '/opt/skills'] } },
    })
  }

  // Seed user-tunable defaults on first install only
  if (kind === 'install') {
    await openclawJson.merge(effects, {
      agents: { defaults: { heartbeat: { every: '24h' } } },
    })
  }
})
