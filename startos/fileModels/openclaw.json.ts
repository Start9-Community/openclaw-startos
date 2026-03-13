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

const authSchema = z.object({
  mode: z.literal('password').catch('password'),
  password: z.string().optional().catch(undefined),
})

const controlUiSchema = z.object({
  enabled: z.literal(true).catch(true),
  allowInsecureAuth: z.literal(true).catch(true),
  dangerouslyAllowHostHeaderOriginFallback: z.literal(true).catch(true),
  dangerouslyDisableDeviceAuth: z.literal(true).catch(true),
})

const gatewaySchema = z.object({
  auth: authSchema.catch(() => authSchema.parse({})),
  controlUi: controlUiSchema.catch(() => controlUiSchema.parse({})),
  trustedProxies: z.array(z.string()).optional().catch(undefined),
})

const modelSchema = z.object({
  primary: z.string().optional().catch(undefined),
  fallbacks: z.array(z.string()).optional().catch(undefined),
})

const heartbeatSchema = z.object({
  every: z.string().catch('24h'),
  target: z.string().optional().catch(undefined),
})

const defaultsSchema = z.object({
  model: modelSchema.catch(() => modelSchema.parse({})),
  heartbeat: heartbeatSchema.catch(() => heartbeatSchema.parse({})),
})

const loadSchema = z.object({
  extraDirs: z.array(z.string()).catch(['/opt/skills']),
})

const skillsSchema = z.object({
  load: loadSchema.catch(() => loadSchema.parse({})),
})

const shape = z.object({
  gateway: gatewaySchema.catch(() => gatewaySchema.parse({})),
  agents: z
    .object({
      defaults: defaultsSchema.catch(() => defaultsSchema.parse({})),
    })
    .optional()
    .catch(undefined),
  skills: skillsSchema.catch(() => skillsSchema.parse({})),
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
