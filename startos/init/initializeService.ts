import { mkdir } from 'fs/promises'
import { openclawJson } from '../fileModels/openclaw.json'
import { startCliConfigYaml } from '../fileModels/startCliConfig.yaml'
import { sdk } from '../sdk'
import { mainMounts, HEARTBEAT_PROMPT } from '../utils'

export const initializeService = sdk.setupOnInit(async (effects, kind) => {
  // Get the OS IP and set url to startos/config.yaml
  const osIp = await sdk.getOsIp(effects)
  const hostUrl = `https://${osIp}`

  await mkdir(sdk.volumes.main.subpath('.startos'), { recursive: true })

  await startCliConfigYaml.merge(effects, { host: hostUrl })

  // Always update workspace bootstrap files on install and upgrade
  await mkdir(sdk.volumes.main.subpath('.openclaw/workspace/memory'), {
    recursive: true,
  })
  await sdk.SubContainer.withTemp(
    effects,
    { imageId: 'openclaw' },
    mainMounts(),
    'copy-soul',
    async (subc) => {
      await subc.execFail(
        [
          'cp',
          '/opt/workspace/SOUL.md',
          '/opt/workspace/IDENTITY.md',
          '/data/.openclaw/workspace/',
        ],
        { user: 'root' },
      )
      // Only seed MEMORY.md if it doesn't already exist, to preserve accumulated memories
      await subc.exec(
        [
          'sh',
          '-c',
          'test -f /data/.openclaw/workspace/MEMORY.md || cp /opt/workspace/MEMORY.md /data/.openclaw/workspace/MEMORY.md',
        ],
        { user: 'root' },
      )
    },
  )

  // Ensure OpenClaw config has required values on disk (zod catches protect our reads,
  // but OpenClaw reads the JSON directly)
  await openclawJson.merge(effects, {
    gateway: {
      auth: { mode: 'password' },
      controlUi: {
        enabled: true,
        dangerouslyAllowHostHeaderOriginFallback: true,
      },
    },
    agents: {
      defaults: {
        // The default route, `owner`, skips the run (`no-route`) until a chat channel has an owner.
        heartbeat: { every: '24h', target: 'none', prompt: HEARTBEAT_PROMPT },
      },
    },
    skills: {
      load: { extraDirs: ['/opt/skills'] },
    },
  })
})
