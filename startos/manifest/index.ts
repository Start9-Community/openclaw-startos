import { setupManifest } from '@start9labs/start-sdk'
import { STARTOS_VERSION } from '../utils'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'openclaw',
  title: 'OpenClaw',
  license: 'MIT',
  packageRepo: 'https://github.com/Start9-Community/openclaw-startos',
  upstreamRepo: 'https://github.com/openclaw/openclaw',
  marketingUrl: 'https://github.com/openclaw/openclaw',
  donationUrl: null,
  description: { short, long },
  volumes: ['main'],
  images: {
    openclaw: {
      source: {
        dockerBuild: {
          workdir: '.',
          buildArgs: {
            STARTOS_VERSION,
          },
        },
      },
      arch: ['x86_64', 'aarch64'],
    },
  },
  // Declared optional; setupDependencies (dependencies.ts) flips the selected
  // local backend to a `running` dependency based on the Configure AI Provider
  // model selection. Cloud providers need no dependency.
  dependencies: {
    ollama: {
      optional: true,
      description: {
        en_US:
          'Optional: run local LLMs with Ollama. Select it as your backend in the Configure AI Provider action.',
      },
      metadata: {
        icon: 'https://raw.githubusercontent.com/Start9Labs/ollama-startos/master/icon.svg',
        title: 'Ollama',
      },
    },
    vllm: {
      optional: true,
      description: {
        en_US:
          "Optional: serve local LLMs through vLLM's OpenAI-compatible API. Select it as your backend in the Configure AI Provider action.",
      },
      metadata: {
        icon: 'https://raw.githubusercontent.com/Start9Labs/vllm-startos/master/icon.svg',
        title: 'vLLM',
      },
    },
    'llama-cpp': {
      optional: true,
      description: {
        en_US:
          'Optional: run local GGUF models with llama.cpp. Select it as your backend in the Configure AI Provider action.',
      },
      metadata: {
        icon: 'https://raw.githubusercontent.com/Start9Labs/llama-cpp-startos/master/icon.png',
        title: 'llama.cpp',
      },
    },
  },
})
