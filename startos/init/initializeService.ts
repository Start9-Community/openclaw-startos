import { randomBytes } from 'crypto'
import { mkdir } from 'fs/promises'
import { sdk } from '../sdk'
import { mainMounts } from '../utils'
import { defaultAgentId } from '../fileModels/authProfiles.json'
import { openclawJson } from '../fileModels/openclaw.json'

export const initializeService = sdk.setupOnInit(async (effects, kind) => {
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
          '/opt/workspace/HEARTBEAT.md',
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

  if (kind !== 'install') {
    // Ensure controlUi has required fields for non-loopback binding
    await openclawJson.merge(effects, {
      gateway: {
        controlUi: {
          dangerouslyAllowHostHeaderOriginFallback: true,
        },
      },
    })
    return
  }

  // Create required directory structure for openclaw
  await mkdir(
    sdk.volumes.main.subpath(`.openclaw/agents/${defaultAgentId}/agent`),
    { recursive: true },
  )
  await mkdir(sdk.volumes.main.subpath('.openclaw/credentials'), {
    recursive: true,
  })

  // Generate initial gateway auth token
  await openclawJson.write(effects, {
    gateway: {
      auth: {
        mode: 'token',
        token: randomBytes(32).toString('hex'),
      },
      controlUi: {
        enabled: true,
        allowInsecureAuth: true,
        dangerouslyAllowHostHeaderOriginFallback: true,
      },
    },
    agents: {
      defaults: {
        model: {
          primary: 'anthropic/claude-opus-4-5',
          fallbacks: [],
        },
        heartbeat: {
          every: '24h',
          target: 'none',
        },
      },
    },
    skills: {
      load: {
        extraDirs: ['/opt/skills'],
      },
    },
  })

  // Don't initialize auth profiles - let openclaw handle defaults
})
