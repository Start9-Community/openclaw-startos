import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// StartOS-side state for the optional SimpleX Websocket Bridge integration:
// only whether file exchange with the bridge is enabled. Kept separate from
// OpenClaw's own `openclaw.json` so toggling it doesn't restart the gateway on
// unrelated config edits.
const shape = z.object({
  enabled: z.boolean().catch(false),
})

export const simplexJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: '/simplex.json' },
  shape,
)
