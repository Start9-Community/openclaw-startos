export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting OpenClaw Gateway!': 0,
  'Web Interface': 1,
  'OpenClaw Gateway is ready': 2,
  'OpenClaw Gateway is not ready': 3,
  'Login to StartOS to enable start-cli authentication for managing the server': 4,

  // interfaces.ts
  'Web UI': 5,
  'The OpenClaw Gateway web interface providing WebChat and control panel': 6,

  // actions/configureApiCredentials.ts
  'Claude Opus 4.8 — most capable': 7,
  'Claude Opus 4.7': 8,
  'Claude Sonnet 4.6 — balanced': 9,
  'Claude Haiku 4.5 — fast & cheap': 10,
  'Claude Fable 5 — premium': 11,
  'GPT-5.5 — strongest': 12,
  'GPT-5.4': 13,
  'GPT-5.4 Mini — fast & cheap': 14,
  'Gemini 3.1 Pro': 15,
  'Gemini 3 Flash — fast': 16,
  'Grok 4.3 — flagship': 17,
  'Grok Build 0.1 — agentic coding': 18,
  'Default Model': 19,
  'The model this provider uses by default. Change it anytime from Web UI chat with the /model command.': 20,
  'Custom Model (optional)': 21,
  'Use an exact model id that is not in the list above. Leave blank to use the dropdown selection.': 22,
  'API Key': 23,
  'API key for this provider. Leave blank to keep the key already saved.': 24,
  'Anthropic (Claude)': 25,
  'OpenAI (GPT)': 26,
  'Google (Gemini)': 27,
  'xAI (Grok)': 28,
  'The exact model id your local server serves. Change it anytime from Web UI chat with the /model command.': 29,
  'Ollama (local)': 30,
  'vLLM (local)': 31,
  'llama.cpp (local)': 32,
  Disabled: 33,
  'Primary Provider': 34,
  'The backend your agent uses by default. Cloud providers (Anthropic, OpenAI, Google, xAI) need an API key; local backends (Ollama, vLLM, llama.cpp) run on your StartOS server and are added as a dependency.': 35,
  'Fallback Provider (optional)': 36,
  'Used automatically when the primary is rate-limited or unavailable. Choose Disabled to skip.': 37,
  'Configure AI Provider': 38,
  'Choose the AI backend your agent uses — a cloud provider (with an API key) or a local model server (Ollama, vLLM, llama.cpp) — pick a model, and optionally add a fallback.': 39,
  'vLLM is selected but its API key could not be read from vllm:public/credentials.json. Make sure vLLM is installed and running.': 40,

  // actions/loginToOs.ts
  'StartOS Master Password': 41,
  'Your StartOS server master password': 42,
  'Enter master password': 43,
  'Login to StartOS': 44,
  'Authenticate start-cli with your StartOS server': 45,
  'This will give root access to your StartOS server to this package. Only do this for a server designated for development purposes.': 46,
  'No host configured. The host URL is set automatically from the OS IP address.': 47,
  'Login failed': 48,
  'Unknown error': 49,
  'Login Successful': 50,
  'start-cli is now authenticated with your StartOS server.': 51,

  // init/taskConfigureApi.ts
  'Configure your AI provider credentials to use OpenClaw': 52,

  // actions/connectTelegram.ts
  'Pairing (approve code on first contact)': 53,
  'Open (anyone can DM)': 54,
  'Bot Token': 55,
  'Telegram bot token from @BotFather. Create a bot at https://t.me/BotFather and copy the token.': 56,
  'DM Policy': 57,
  'How to handle direct messages from new users': 58,
  'Connect Telegram': 59,
  'Connect a Telegram bot so you can chat with your agent from Telegram. Create a bot with @BotFather first.': 60,
  Channels: 61,
  'Telegram Connected': 62,
  'Telegram bot configured. Restart the service for changes to take effect. DM your bot to start chatting with your agent.': 63,

  // actions/connectWhatsapp.ts
  'Allowlist (only allowed numbers)': 64,
  'Allowed Phone Numbers': 65,
  'Comma-separated phone numbers in international format (e.g. +15551234567,+15559876543). Only used with Allowlist policy.': 66,
  'Connect WhatsApp': 67,
  'Connect WhatsApp so you can chat with your agent. Links your WhatsApp account via QR code.': 68,
  'WhatsApp login failed': 69,
  'WhatsApp QR Code': 70,
  'Scan this QR code with WhatsApp (Settings > Linked Devices > Link a Device):': 71,

  // actions/setPassword.ts
  'Reset Password': 72,
  'Set Password': 73,
  'Reset your OpenClaw gateway password': 74,
  'Set the gateway password needed to log in to the Control UI': 75,
  'Password Set': 76,
  'Use this password to log in to the OpenClaw Control UI.': 77,

  // init/taskSetPassword.ts
  'Set your OpenClaw gateway password': 78,

  // actions/revokeStartOsAccess.ts
  'Revoke StartOS Access': 79,
  "Remove OpenClaw's stored start-cli authentication so it can no longer administer this StartOS server": 80,
  'OpenClaw will lose StartOS administrative access until you run Login to StartOS again.': 81,
  'StartOS Access Revoked': 82,
  "OpenClaw's stored start-cli authentication was removed. Run Login to StartOS to grant access again.": 83,

  // actions/configureApiCredentials.ts
  'The selected local backend is not yet reachable on the internal network. Make sure it is installed and running, then run Configure AI Provider again.': 84,

  // actions/configureSimplex.ts
  'Configure SimpleX': 85,
  'Enable the SimpleX channel and configure how it handles direct messages.': 86,
  'Enable SimpleX Channel': 87,
  'Install the openclaw-simplex plugin and configure it to use the SimpleX Websocket Bridge service. Note: installation may take a few minutes.': 88,
  Enabled: 89,
  'Could not install the SimpleX plugin': 90,
  'Could not uninstall the SimpleX plugin: ': 91,
  'The SimpleX Websocket Bridge is not reachable on the internal network. Make sure it is installed and running, then try again.': 92,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
