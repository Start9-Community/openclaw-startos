import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const telegramChannelShape = z.looseObject({
  enabled: z.boolean(),
  botToken: z.string().optional().catch(undefined),
  dmPolicy: z.string().optional().catch(undefined),
})

const whatsappChannelShape = z.looseObject({
  dmPolicy: z.string().optional().catch(undefined),
  allowFrom: z.array(z.string()).optional().catch(undefined),
})

const simplexChannelShape = z.looseObject({
  enabled: z.boolean().optional().catch(undefined),
  dmPolicy: z.string().optional().catch(undefined),
  connection: z
    .looseObject({
      allowUnsafeRemoteWs: z.boolean().optional().catch(undefined),
      wsUrl: z.string().optional().catch(undefined),
      filesFolder: z.string().optional().catch(undefined),
      outboundFolder: z.string().optional().catch(undefined),
      outboundFolderOnClient: z.string().optional().catch(undefined),
    })
    .optional()
    .catch(undefined),
})

const authSchema = z.looseObject({
  mode: z.literal('password').catch('password'),
  password: z.string().optional().catch(undefined),
})

// z.literal, not lenient defaults: StartOS fronts the gateway on addresses
// OpenClaw's origin check rejects, so with this off the UI refuses to connect.
// The compensating control is the critical password task -- never weaken that.
const controlUiSchema = z.looseObject({
  enabled: z.literal(true).catch(true),
  dangerouslyAllowHostHeaderOriginFallback: z.literal(true).catch(true),
})

const gatewaySchema = z.looseObject({
  auth: authSchema.catch(() => authSchema.parse({})),
  controlUi: controlUiSchema.catch(() => controlUiSchema.parse({})),
  trustedProxies: z.array(z.string()).optional().catch(undefined),
})

const modelSchema = z.looseObject({
  primary: z.string().optional().catch(undefined),
  fallbacks: z.array(z.string()).optional().catch(undefined),
})

const heartbeatSchema = z.looseObject({
  every: z.string().catch('24h'),
  target: z.string().optional().catch(undefined),
  prompt: z.string().optional().catch(undefined),
})

const defaultsSchema = z.looseObject({
  model: modelSchema.catch(() => modelSchema.parse({})),
  heartbeat: heartbeatSchema.catch(() => heartbeatSchema.parse({})),
})

const loadSchema = z.looseObject({
  extraDirs: z.array(z.string()).catch(['/opt/skills']),
})

const skillsSchema = z.looseObject({
  load: loadSchema.catch(() => loadSchema.parse({})),
})

// Custom/local provider catalog (openclaw.json `models.providers`). Configure AI
// Provider writes an `openai-completions` entry here for each selected local
// backend (Ollama/vLLM/llama.cpp), pointing at its LXC-bridge endpoint.
const providerEntryShape = z.looseObject({
  baseUrl: z.string().optional().catch(undefined),
  apiKey: z.string().optional().catch(undefined),
  api: z.string().optional().catch(undefined),
  timeoutSeconds: z.number().optional().catch(undefined),
  models: z
    .array(
      z.looseObject({
        id: z.string(),
        name: z.string().optional().catch(undefined),
        input: z.array(z.string()).optional().catch(undefined),
      }),
    )
    .optional()
    .catch(undefined),
})

const modelsSchema = z.looseObject({
  mode: z.string().optional().catch(undefined),
  providers: z
    .record(z.string(), providerEntryShape)
    .optional()
    .catch(undefined),
})

// Plugin policy (openclaw.json `plugins`). `openclaw plugins install` maintains
// these itself, but Configure SimpleX has to repair them when it skips the
// install (plugin already at/above the pinned version): an installed plugin
// still needs `entries.<id>.enabled` to load, and a restrictive `allow` list
// still has to name it.
const pluginsSchema = z.looseObject({
  allow: z.array(z.string()).optional().catch(undefined),
  entries: z
    .record(
      z.string(),
      z.looseObject({ enabled: z.boolean().optional().catch(undefined) }),
    )
    .optional()
    .catch(undefined),
})

const shape = z.looseObject({
  gateway: gatewaySchema.catch(() => gatewaySchema.parse({})),
  agents: z
    .looseObject({
      defaults: defaultsSchema.catch(() => defaultsSchema.parse({})),
    })
    .optional()
    .catch(undefined),
  models: modelsSchema.optional().catch(undefined),
  skills: skillsSchema.catch(() => skillsSchema.parse({})),
  channels: z
    .looseObject({
      telegram: telegramChannelShape.optional().catch(undefined),
      whatsapp: whatsappChannelShape.optional().catch(undefined),
      'openclaw-simplex': simplexChannelShape.optional().catch(undefined),
    })
    .optional()
    .catch(undefined),
  plugins: pluginsSchema.optional().catch(undefined),
})

export const openclawJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '.openclaw/openclaw.json' },
  shape,
)
