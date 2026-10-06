import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_2026_9_4_0 } from './v2026.9.4_0'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_2026_9_4_0],
})
