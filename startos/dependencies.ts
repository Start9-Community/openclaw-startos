import { sdk } from './sdk'
import { openclawJson } from './fileModels/openclaw.json'
import { simplexDependencies } from './simplex'

// Version ranges for the local-inference backends (mirrors hermes-agent). Keyed
// by the dependency/package id, which is also the `provider/model` prefix the
// Configure AI Provider action writes.
const LOCAL_DEP_RANGES: Record<string, string> = {
  ollama: '>=0.21.0:0',
  vllm: '>=0.16.0:0.1',
  'llama-cpp': '>=1.0.9544:0',
}

export const setDependencies = sdk.setupDependencies(async ({ effects }) => {
  // Reactive read: setupDependencies re-runs whenever the model selection
  // changes — including changes OpenClaw makes itself (e.g. /model in chat) —
  // so the local-backend dependency tracks the active provider with no explicit
  // re-trigger needed.
  const model = await openclawJson
    .read((c) => c.agents?.defaults?.model)
    .const(effects)

  // Which providers are in use (primary + fallbacks), by their `provider/...` prefix.
  const inUse = new Set(
    [model?.primary, ...(model?.fallbacks ?? [])]
      .filter((r): r is string => !!r)
      .map((r) => r.split('/')[0]),
  )

  const deps: Record<
    string,
    { kind: 'running'; versionRange: string; healthChecks: string[] }
  > = {}
  for (const [id, versionRange] of Object.entries(LOCAL_DEP_RANGES)) {
    if (inUse.has(id)) {
      deps[id] = { kind: 'running', versionRange, healthChecks: ['primary'] }
    }
  }

  // Optional integrations contribute their fragment when enabled ({} otherwise).
  return {
    ...deps,
    ...(await simplexDependencies(effects)),
  }
})
