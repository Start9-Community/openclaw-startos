import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// start-cli config.yaml shape - only validate what we care about
const shape = z.object({
  host: z.string().optional().catch(undefined),
})

export const startCliConfigYaml = FileHelper.yaml(
  { base: sdk.volumes.main, subpath: '.startos/config.yaml' },
  shape,
)
