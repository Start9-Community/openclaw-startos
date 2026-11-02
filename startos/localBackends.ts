import { T } from '@start9labs/start-sdk'
import { openclawJson } from './fileModels/openclaw.json'
import { sdk } from './sdk'
import { readDependencyApiKey } from './utils'

// Local inference backends route to the matching StartOS package over the LXC
// bridge. Configure AI Provider writes a `models.providers.<id>` entry pointing
// at the dependency's resolved bridge endpoint (`depApiBaseUrl` + `path`); the
// union key is also the `provider/model` prefix and the dependency id
// dependencies.ts gates on. Ollama uses its native API (`api: "ollama"`, NO
// `/v1` — `/v1` breaks tool calling); vLLM/llama.cpp are OpenAI-compatible
// (`/v1`). needsKey backends read a real key from the dependency's published
// `public/credentials.json`; the rest take any value. String-literal host and
// interface ids because these are optional runtime deps, not npm `-startos`
// packages whose constants we could import.
export const LOCAL_BACKENDS: Record<
  string,
  {
    path: string
    api: string
    needsKey: boolean
    hostId: string
    interfaceId: string
  }
> = {
  ollama: {
    path: '',
    api: 'ollama',
    needsKey: false,
    hostId: 'api-multi',
    interfaceId: 'api',
  },
  vllm: {
    path: '/v1',
    api: 'openai-completions',
    needsKey: true,
    hostId: 'api-multi',
    interfaceId: 'api',
  },
  // llama.cpp's `api-multi` host is Basic-gated for browsers; its key-gated
  // `api-key` host is the one that accepts the published Bearer key.
  'llama-cpp': {
    path: '/v1',
    api: 'openai-completions',
    needsKey: true,
    hostId: 'api-key',
    interfaceId: 'openai-api',
  },
}

/** The backend's OpenAI/Ollama base URL over the LXC bridge, or undefined. */
export const depApiBaseUrl = async (effects: T.Effects, packageId: string) => {
  const { hostId, interfaceId, path } = LOCAL_BACKENDS[packageId]
  const url = await sdk.host
    .get(effects, { hostId, packageId }, (host) => {
      const iface =
        host &&
        Object.values(host.bindings)
          .flatMap((b) => Object.values(b.interfaces))
          .find((i) => i.id === interfaceId)
      return iface
        ? iface.addressInfo
            .filter({ kind: 'bridge', predicate: (h) => !h.ssl })
            .format('urlstring')[0]
        : undefined
    })
    .once()
  return url ? `${url}${path}` : undefined
}

/** The key to send the backend: its published key, or a placeholder. */
export const depApiKey = async (effects: T.Effects, packageId: string) =>
  LOCAL_BACKENDS[packageId].needsKey
    ? readDependencyApiKey(effects, packageId)
    : 'startos'

/**
 * Repoint every configured local backend at its current address and key.
 * openclaw.json holds both as literals written by Configure AI Provider, so
 * they go stale when a backend moves its API to another host or rotates its
 * key. Unresolvable values are left as they are.
 */
export async function refreshLocalBackends(effects: T.Effects): Promise<void> {
  const providers =
    (await openclawJson.read((c) => c.models?.providers).once()) ?? {}
  const updates: Record<string, { baseUrl?: string; apiKey?: string }> = {}

  for (const [id, entry] of Object.entries(providers)) {
    if (!(id in LOCAL_BACKENDS)) continue
    const baseUrl = await depApiBaseUrl(effects, id)
    const apiKey = await depApiKey(effects, id)
    const update = {
      ...(baseUrl && baseUrl !== entry.baseUrl ? { baseUrl } : {}),
      ...(apiKey && apiKey !== entry.apiKey ? { apiKey } : {}),
    }
    if (Object.keys(update).length) updates[id] = update
  }

  if (Object.keys(updates).length) {
    await openclawJson.merge(effects, { models: { providers: updates } })
  }
}
