import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const telegramChannelShape = z.object({
  enabled: z.boolean(),
  botToken: z.string().optional().catch(undefined),
  dmPolicy: z.string().optional().catch(undefined),
})

const whatsappChannelShape = z.object({
  dmPolicy: z.string().optional().catch(undefined),
  allowFrom: z.array(z.string()).optional().catch(undefined),
})

const shape = z.object({
  gateway: z.object({
    auth: z.object({
      mode: z.literal('password').catch('password'),
      password: z.string().optional().catch(undefined),
    }),
    controlUi: z.object({
      enabled: z.literal(true).catch(true),
      allowInsecureAuth: z.literal(true).catch(true),
      dangerouslyAllowHostHeaderOriginFallback: z.literal(true).catch(true),
      dangerouslyDisableDeviceAuth: z.literal(true).catch(true),
    }),
    trustedProxies: z.array(z.string()).optional().catch(undefined),
  }),
  agents: z
    .object({
      defaults: z.object({
        model: z.object({
          primary: z.string().optional().catch(undefined),
          fallbacks: z.array(z.string()).optional().catch(undefined),
        }),
        heartbeat: z.object({
          every: z.string().optional().catch(undefined),
          target: z.string().optional().catch(undefined),
        }),
      }),
    })
    .optional()
    .catch(undefined),
  skills: z.object({
    load: z.object({
      extraDirs: z.array(z.string()).catch(['/opt/skills']),
    }),
  }),
  channels: z
    .object({
      telegram: telegramChannelShape.optional().catch(undefined),
      whatsapp: whatsappChannelShape.optional().catch(undefined),
    })
    .optional()
    .catch(undefined),
})

export const openclawJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '.openclaw/openclaw.json' },
  shape,
)
