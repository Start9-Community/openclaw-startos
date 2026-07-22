import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * StartOS-side state for the optional SimpleX Websocket Bridge integration.
 *
 * Tracks only whether file exchange with the bridge is enabled — kept separate
 * from OpenClaw's own `openclaw.json` channel config so toggling the StartOS
 * integration doesn't perturb OpenClaw's runtime config or restart the gateway
 * on unrelated config edits.
 */
const shape = z.object({
  enabled: z.boolean().catch(false),
})

export const simplexJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/simplex.json' },
  shape,
)
