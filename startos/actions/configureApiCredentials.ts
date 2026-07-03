import { T } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { authProfilesJson, AuthProfile } from '../fileModels/authProfiles.json'
import { openclawJson } from '../fileModels/openclaw.json'
import { readDependencyApiKey } from '../utils'
import { i18n } from '../i18n'

const { InputSpec, Value, Variants } = sdk

// Cloud providers OpenClaw resolves from environment API keys (the path main.ts
// bridges and the only one current OpenClaw builds read at runtime — see #12).
// The union key is OpenClaw's provider prefix in `provider/model` refs; the env
// var is what main.ts sets. Keep both in sync with main.ts `providerKeyEnvVar`.
const MANAGED_PROVIDERS = ['anthropic', 'openai', 'google', 'xai'] as const

// Local inference backends route to the matching StartOS package over the LXC
// bridge. The save handler writes a `models.providers.<id>` entry pointing at
// the dependency's resolved bridge endpoint (`depApiBaseUrl` + `path`); the
// union key is also the `provider/model` prefix and the dependency id
// setupDependencies gates on. Ollama uses its native API (`api: "ollama"`, NO
// `/v1` — `/v1` breaks tool calling); vLLM/llama.cpp are OpenAI-compatible
// (`/v1`). needsKey backends read a real key from the dependency's published
// credentials; the rest take any value on a private LAN.
const LOCAL_BACKENDS: Record<
  string,
  { path: string; api: string; needsKey: boolean }
> = {
  ollama: { path: '', api: 'ollama', needsKey: false },
  vllm: { path: '/v1', api: 'openai-completions', needsKey: true },
  'llama-cpp': { path: '/v1', api: 'openai-completions', needsKey: false },
}

// Local-inference deps (ollama/vLLM/llama.cpp) each export an OpenAI-compatible
// `api` interface on a MultiHost named `api-multi`. Resolve its plain-HTTP
// LXC-bridge base URL (e.g. `http://10.0.3.5:11434`) at apply time — the retired
// `<pkg>.startos` DNS no longer resolves between containers. String-literal ids
// because these are optional runtime deps, not npm `-startos` packages whose id
// constants we could import.
const DEP_API_HOST_ID = 'api-multi'
const DEP_API_INTERFACE_ID = 'api'

const depApiBaseUrl = (effects: T.Effects, packageId: string) =>
  sdk.host
    .get(effects, { hostId: DEP_API_HOST_ID, packageId }, (host) => {
      const iface =
        host &&
        Object.values(host.bindings)
          .flatMap((b) => Object.values(b.interfaces))
          .find((i) => i.id === DEP_API_INTERFACE_ID)
      return iface
        ? iface.addressInfo
            .filter({ kind: 'bridge', predicate: (h) => !h.ssl })
            .format('urlstring')[0]
        : undefined
    })
    .once()

// Curated default-model catalogs (exact API model id → label). The chosen model
// is only the default; it can be changed anytime from Web UI chat with /model,
// and the Custom Model field below accepts any id not yet listed.
const ANTHROPIC_MODELS = {
  'claude-opus-4-8': i18n('Claude Opus 4.8 — most capable'),
  'claude-opus-4-7': i18n('Claude Opus 4.7'),
  'claude-sonnet-4-6': i18n('Claude Sonnet 4.6 — balanced'),
  'claude-haiku-4-5': i18n('Claude Haiku 4.5 — fast & cheap'),
  'claude-fable-5': i18n('Claude Fable 5 — premium'),
}
const OPENAI_MODELS = {
  'gpt-5.5': i18n('GPT-5.5 — strongest'),
  'gpt-5.4': i18n('GPT-5.4'),
  'gpt-5.4-mini': i18n('GPT-5.4 Mini — fast & cheap'),
}
const GEMINI_MODELS = {
  'gemini-3.1-pro-preview': i18n('Gemini 3.1 Pro'),
  'gemini-3-flash-preview': i18n('Gemini 3 Flash — fast'),
}
const GROK_MODELS = {
  'grok-4.3': i18n('Grok 4.3 — flagship'),
  'grok-build-0.1': i18n('Grok Build 0.1 — agentic coding'),
}

// Default-model dropdown + an optional Custom field, so a brand-new id can be
// used without waiting for a package update. `pickModel` resolves the pair.
const modelDropdown = <V extends Record<string, string>>(
  values: V,
  def: keyof V & string,
) => ({
  model: Value.select({
    name: i18n('Default Model'),
    description: i18n(
      'The model this provider uses by default. Change it anytime from Web UI chat with the /model command.',
    ),
    default: def,
    values,
  }),
  customModel: Value.text({
    name: i18n('Custom Model (optional)'),
    description: i18n(
      'Use an exact model id that is not in the list above. Leave blank to use the dropdown selection.',
    ),
    required: false,
    default: null,
    placeholder: def,
  }),
})

const apiKeyField = (placeholder: string) =>
  Value.text({
    name: i18n('API Key'),
    description: i18n(
      'API key for this provider. Leave blank to keep the key already saved.',
    ),
    required: false,
    default: null,
    masked: true,
    placeholder,
  })

// Resolve the model from a dropdown+custom pair — a filled Custom field wins.
const pickModel = (v: { model?: string; customModel?: string | null }) =>
  (v.customModel ?? '').trim() || v.model || ''

// Prefill a dropdown+custom pair: select a known id, else route an unknown
// (custom) id to the Custom field. Never returns an API key (keys aren't echoed).
const prefillModel = (
  catalog: Record<string, string>,
  id: string | undefined,
) => (id == null ? {} : id in catalog ? { model: id } : { customModel: id })

const providerSpec = (
  models: Record<string, string>,
  def: string,
  keyPlaceholder: string,
) =>
  InputSpec.of({
    ...modelDropdown(models, def),
    apiKey: apiKeyField(keyPlaceholder),
  })

const anthropic = {
  name: i18n('Anthropic (Claude)'),
  spec: providerSpec(ANTHROPIC_MODELS, 'claude-opus-4-8', 'sk-ant-...'),
}
const openai = {
  name: i18n('OpenAI (GPT)'),
  spec: providerSpec(OPENAI_MODELS, 'gpt-5.5', 'sk-...'),
}
const google = {
  name: i18n('Google (Gemini)'),
  spec: providerSpec(GEMINI_MODELS, 'gemini-3.1-pro-preview', 'AIza...'),
}
const xai = {
  name: i18n('xAI (Grok)'),
  spec: providerSpec(GROK_MODELS, 'grok-4.3', 'xai-...'),
}

// Local backends take a single served-model field; baseUrl (and vLLM's key) are
// wired by the save handler into openclaw.json `models.providers.<id>`.
const servedModelField = (placeholder: string) =>
  Value.text({
    name: i18n('Default Model'),
    description: i18n(
      'The exact model id your local server serves. Change it anytime from Web UI chat with the /model command.',
    ),
    required: true,
    default: null,
    placeholder,
  })

const ollama = {
  name: i18n('Ollama (local)'),
  spec: InputSpec.of({ model: servedModelField('llama3.1:8b') }),
}
const vllm = {
  name: i18n('vLLM (local)'),
  spec: InputSpec.of({ model: servedModelField('Qwen/Qwen2.5-7B-Instruct') }),
}
const llamacpp = {
  name: i18n('llama.cpp (local)'),
  spec: InputSpec.of({
    model: servedModelField('the model your server serves'),
  }),
}

const allVariants = {
  anthropic,
  openai,
  google,
  xai,
  ollama,
  vllm,
  'llama-cpp': llamacpp,
}

const primaryVariants = Variants.of(allVariants)
const fallbackVariants = Variants.of({
  disabled: { name: i18n('Disabled'), spec: InputSpec.of({}) },
  ...allVariants,
})

const inputSpec = InputSpec.of({
  primary: Value.union({
    name: i18n('Primary Provider'),
    description: i18n(
      'The backend your agent uses by default. Cloud providers (Anthropic, OpenAI, Google, xAI) need an API key; local backends (Ollama, vLLM, llama.cpp) run on your StartOS server and are added as a dependency.',
    ),
    default: 'anthropic',
    variants: primaryVariants,
  }),
  fallback: Value.union({
    name: i18n('Fallback Provider (optional)'),
    description: i18n(
      'Used automatically when the primary is rate-limited or unavailable. Choose Disabled to skip.',
    ),
    default: 'disabled',
    variants: fallbackVariants,
  }),
})

// --- Prefill helpers ---

function splitModelId(id: string | undefined) {
  if (!id) return undefined
  const i = id.indexOf('/')
  return i === -1
    ? { provider: 'anthropic', model: id }
    : { provider: id.slice(0, i), model: id.slice(i + 1) }
}

// Reconstruct a provider union value from a stored `provider/model` ref. Returns
// null for an unknown/unmanaged provider so the caller can fall back.
function prefillProvider(id: string | undefined) {
  const parsed = splitModelId(id)
  if (!parsed) return null
  switch (parsed.provider) {
    case 'anthropic':
      return {
        selection: 'anthropic' as const,
        value: prefillModel(ANTHROPIC_MODELS, parsed.model),
      }
    case 'openai':
      return {
        selection: 'openai' as const,
        value: prefillModel(OPENAI_MODELS, parsed.model),
      }
    case 'google':
      return {
        selection: 'google' as const,
        value: prefillModel(GEMINI_MODELS, parsed.model),
      }
    case 'xai':
      return {
        selection: 'xai' as const,
        value: prefillModel(GROK_MODELS, parsed.model),
      }
    case 'ollama':
      return { selection: 'ollama' as const, value: { model: parsed.model } }
    case 'vllm':
      return { selection: 'vllm' as const, value: { model: parsed.model } }
    case 'llama-cpp':
      return {
        selection: 'llama-cpp' as const,
        value: { model: parsed.model },
      }
    default:
      return null
  }
}

// --- Save helper ---

type ProviderUnion = {
  selection: string
  value: { model?: string; customModel?: string | null; apiKey?: string | null }
}

// --- Action ---

export const configureApiCredentials = sdk.Action.withInput(
  'configure-api-credentials',

  async ({ effects }) => ({
    name: i18n('Configure AI Provider'),
    description: i18n(
      'Choose the AI backend your agent uses — a cloud provider (with an API key) or a local model server (Ollama, vLLM, llama.cpp) — pick a model, and optionally add a fallback.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  inputSpec,

  // Pre-fill provider + model from the stored config. API keys are never echoed
  // back into the form (the field's `default: null` leaves them blank).
  async ({ effects }) => {
    const model = await openclawJson
      .read((c) => c.agents?.defaults?.model)
      .once()
      .catch(() => undefined)

    return {
      primary: prefillProvider(model?.primary) ?? {
        selection: 'anthropic' as const,
        value: {},
      },
      fallback: prefillProvider(model?.fallbacks?.[0]) ?? {
        selection: 'disabled' as const,
        value: {},
      },
    }
  },

  // Save: cloud providers write a token profile (bridged to env by main.ts);
  // local backends write a `models.providers.<id>` entry. Both set the
  // `provider/model` refs in openclaw.json, then restart.
  async ({ effects, input }) => {
    const existing: Record<string, AuthProfile> =
      (await authProfilesJson.read((p) => p.profiles).once()) ?? {}

    const profiles: Record<string, AuthProfile> = { ...existing }
    // Drop our managed cloud defaults; re-add only the providers selected below.
    // Separately-created profiles (e.g. OAuth, named accounts) are preserved.
    for (const p of MANAGED_PROVIDERS) delete profiles[`${p}:default`]

    type LocalEntry = {
      baseUrl: string
      apiKey: string
      api: string
      timeoutSeconds: number
      models: { id: string; name: string; input: string[] }[]
    }
    // models.providers entries for the selected local backend(s), deep-merged
    // into openclaw.json. A backend the user has stopped using lingers
    // harmlessly (inert once unreferenced; its dependency is dropped by
    // setupDependencies).
    const providers: Record<string, LocalEntry> = {}

    const resolve = async (u: ProviderUnion): Promise<string | undefined> => {
      if (u.selection === 'disabled') return undefined
      const sel = u.selection

      // Cloud provider — API key bridged to env via main.ts.
      if ((MANAGED_PROVIDERS as readonly string[]).includes(sel)) {
        const prev = existing[`${sel}:default`]
        const key =
          (u.value.apiKey ?? '').trim() ||
          (prev?.type === 'token' ? prev.token : undefined)
        if (key) {
          profiles[`${sel}:default`] = {
            type: 'token',
            provider: sel,
            token: key,
          }
        }
        return `${sel}/${pickModel(u.value)}`
      }

      // Local backend — an openai-completions provider in models.providers.
      const backend = LOCAL_BACKENDS[sel]
      const model = (u.value.model ?? '').trim()
      let apiKey = 'startos' // ignored by keyless backends (Ollama/llama.cpp)
      if (backend.needsKey) {
        const k = await readDependencyApiKey(effects, sel)
        if (!k) {
          throw new Error(
            i18n(
              'vLLM is selected but its API key could not be read from vllm:public/credentials.json. Make sure vLLM is installed and running.',
            ),
          )
        }
        apiKey = k
      }
      const baseUrl = await depApiBaseUrl(effects, sel)
      if (!baseUrl) {
        throw new Error(
          i18n(
            'The selected local backend is not yet reachable on the internal network. Make sure it is installed and running, then run Configure AI Provider again.',
          ),
        )
      }
      const entry: LocalEntry = providers[sel] ?? {
        baseUrl: `${baseUrl}${backend.path}`,
        apiKey,
        api: backend.api,
        timeoutSeconds: 300,
        models: [],
      }
      // Overriding models.providers disables auto-discovery, so the chosen model
      // must be listed explicitly for OpenClaw to treat it as known.
      if (model && !entry.models.some((m) => m.id === model)) {
        entry.models.push({ id: model, name: model, input: ['text'] })
      }
      providers[sel] = entry
      return `${sel}/${model}`
    }

    const primary = await resolve(input.primary as ProviderUnion)
    const fallbackId = await resolve(input.fallback as ProviderUnion)

    await authProfilesJson.write(effects, { profiles })
    await openclawJson.merge(effects, {
      models: { mode: 'merge', providers },
      agents: {
        defaults: {
          model: { primary, fallbacks: fallbackId ? [fallbackId] : [] },
        },
      },
    })

    // setupDependencies reads the model selection reactively, so writing the
    // config above already updates the local-backend dependency — just restart.
    await effects.restart()
  },
)
