import { T } from '@start9labs/start-sdk'
import { sdk } from './sdk'
import { openclawJson } from './fileModels/openclaw.json'
import { simplexJson } from './fileModels/simplex.json'
import { SIMPLEX_BRIDGE_ID } from './simplex'

// Reactive read: OpenClaw rewrites the model selection itself (e.g. /model in
// chat), so the local-backend dependency tracks the active provider with no
// explicit re-trigger needed. Keyed by the `provider/...` prefix, which is also
// the dependency id.
const providerInUse =
  (id: string) =>
  async ({ effects }: { effects: T.Effects }) => {
    const model = await openclawJson
      .read((c) => c.agents?.defaults?.model)
      .const(effects)
    return [model?.primary, ...(model?.fallbacks ?? [])].some(
      (r) => r?.split('/')[0] === id,
    )
  }

const ollama = sdk.Dependency.optional('ollama', {
  description: {
    en_US:
      'Optional: run local LLMs with Ollama. Select it as your backend in the Configure AI Provider action.',
  },
  metadata: {
    icon: 'https://raw.githubusercontent.com/Start9Labs/ollama-startos/master/icon.svg',
    title: 'Ollama',
  },
  versionRange: '>=0.31.2:2',
  kind: 'running',
  healthChecks: ['primary'],
  enabled: providerInUse('ollama'),
})

const vllm = sdk.Dependency.optional('vllm', {
  description: {
    en_US:
      "Optional: serve local LLMs through vLLM's OpenAI-compatible API. Select it as your backend in the Configure AI Provider action.",
  },
  metadata: {
    icon: 'https://raw.githubusercontent.com/Start9Labs/vllm-startos/master/icon.svg',
    title: 'vLLM',
  },
  versionRange: '>=0.23.1-rc.0:13',
  kind: 'running',
  healthChecks: ['primary'],
  enabled: providerInUse('vllm'),
})

const llamaCpp = sdk.Dependency.optional('llama-cpp', {
  description: {
    en_US:
      'Optional: run local GGUF models with llama.cpp. Select it as your backend in the Configure AI Provider action.',
  },
  metadata: {
    icon: 'https://raw.githubusercontent.com/Start9Labs/llama-cpp-startos/master/icon.png',
    title: 'llama.cpp',
  },
  versionRange: '>=1.0.9994:1',
  kind: 'running',
  healthChecks: ['primary'],
  enabled: providerInUse('llama-cpp'),
})

const simplexBridge = sdk.Dependency.optional(SIMPLEX_BRIDGE_ID, {
  description: {
    en_US:
      'Optional: exchange files over SimpleX. Enable it in the Configure SimpleX action to mount the bridge file-exchange directories.',
  },
  metadata: {
    icon: 'https://raw.githubusercontent.com/Start9-Community/simplex-websocket-bridge-startos/master/icon.svg',
    title: 'SimpleX Websocket Bridge',
  },
  versionRange: '>=0.3.0:0',
  kind: 'running',
  healthChecks: ['websocket'],
  enabled: async ({ effects }) =>
    !!(await simplexJson.read((c) => c.enabled).const(effects)),
})

export const dependencies = sdk.Dependencies.of()
  .addDependency(ollama)
  .addDependency(vllm)
  .addDependency(llamaCpp)
  .addDependency(simplexBridge)
