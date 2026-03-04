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

const channelsShape = z.object({
  telegram: telegramChannelShape.optional().catch(undefined),
  whatsapp: whatsappChannelShape.optional().catch(undefined),
})

const shape = z.object({
  gateway: z.object({
    auth: z.object({
      mode: z.literal('token'),
      token: z.string(),
    }),
    controlUi: z.object({
      enabled: z.boolean(),
      allowInsecureAuth: z.boolean(),
    }),
  }),
  agents: z.object({
    defaults: z.object({
      model: z.object({
        primary: z.string(),
        fallbacks: z.array(z.string()),
      }),
      heartbeat: z.object({
        every: z.string(),
        target: z.string(),
      }),
    }),
  }),
  skills: z.object({
    load: z.object({
      extraDirs: z.array(z.string()),
    }),
  }),
  channels: channelsShape.optional().catch(undefined),
})

export const openclawJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '.openclaw/openclaw.json' },
  shape,
)
