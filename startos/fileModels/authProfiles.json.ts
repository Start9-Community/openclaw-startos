import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Auth Profiles: ~/.openclaw/agents/<agentId>/agent/auth-profiles.json

// Default agent ID - openclaw uses 'main' for the primary agent
export const defaultAgentId = 'main'

// OpenClaw profile types
const tokenProfileShape = z.object({
  type: z.literal('token'),
  provider: z.string(),
  token: z.string(),
})

const oauthProfileShape = z.object({
  type: z.literal('oauth'),
  provider: z.string(),
  access: z.string(),
  refresh: z.string().optional(),
  expires: z.number().optional(),
})

const profileShape = z.union([tokenProfileShape, oauthProfileShape])

// The file has a top-level "profiles" key with "provider:label" entries
const shape = z.object({
  profiles: z.any(),
})

export const authProfilesJson = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: `.openclaw/agents/${defaultAgentId}/agent/auth-profiles.json`,
  },
  shape,
)

// Type exports for use in actions
export type TokenProfile = {
  type: 'token'
  provider: string
  token: string
}

export type OAuthProfile = {
  type: 'oauth'
  provider: string
  access: string
  refresh?: string
  expires?: number
}

export type AuthProfile = TokenProfile | OAuthProfile

export type AuthProfilesFile = {
  profiles: Record<string, AuthProfile>
}
