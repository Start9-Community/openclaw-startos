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
  'The backend your agent uses by default.\n- Anthropic (Claude): needs an Anthropic API key\n- OpenAI (GPT): needs an OpenAI API key\n- Google (Gemini): needs a Google Gemini API key\n- xAI (Grok): needs an xAI API key\n- Ollama (local): the Ollama service on this server, added as a dependency\n- vLLM (local): the vLLM service on this server, added as a dependency\n- llama.cpp (local): the llama.cpp service on this server, added as a dependency': 35,
  'Fallback Provider (optional)': 36,
  'Used automatically when the primary is rate-limited or unavailable.\n- Disabled: no fallback\n- Any other choice: a backend from the same list as Primary Provider': 37,
  'Configure AI Provider': 38,
  'Choose the AI backend your agent uses — a cloud provider (with an API key) or a local model server (Ollama, vLLM, llama.cpp) — pick a model, and optionally add a fallback.': 39,
  'vLLM is selected but its API key could not be read from vllm:public/credentials.json. Make sure vLLM is installed and running.': 40,

  // actions/loginToOs.ts
  'StartOS Master Password': 41,
  'Used once to log start-cli in; OpenClaw keeps the resulting key, not the password.': 42,
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
  'Who can message your agent directly.\n- Pairing: a new contact gets a code on first contact and can chat once you approve it\n- Open: anyone can message your agent': 58,
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
  '- Disabled: removes the SimpleX channel and uninstalls the openclaw-simplex plugin\n- Enabled: installs the openclaw-simplex plugin, which can take a few minutes, and connects it to the SimpleX Websocket Bridge, which must be installed and running': 88,
  Enabled: 89,
  'Could not install the SimpleX plugin': 90,
  'Could not uninstall the SimpleX plugin: ': 91,
  'The SimpleX Websocket Bridge is not reachable on the internal network. Make sure it is installed and running, then try again.': 92,
  'Submit Configure SimpleX to upgrade the SimpleX plugin': 93,

  // repair-openclaw action
  'Repair OpenClaw': 94,
  'Run one of OpenClaw’s maintenance commands against the stopped service.': 95,
  'Back up the service before applying repairs.': 96,
  Command: 97,
  'Repair config and database (doctor --fix)': 98,
  'Apply recommended repairs': 99,
  'If not checked, no changes will be made.': 100,
  'Import sessions to SQLite (doctor --session-sqlite)': 101,
  'Apply changes': 102,
  'Maintenance Result': 103,
  'Exit Code': 104,
  Output: 105,
  'No output': 106,

  // versions/current.ts
  'OpenClaw could not migrate its state': 107,

  // approve-devices action
  'Approve Browser Pairing': 108,
  'Approve every browser waiting to pair with the Web UI. Log in to the Web UI first; it says "pairing required" until this runs.': 109,
  'Only run this right after you tried to log in yourself: every pending request is approved, and an approved browser keeps its access until you remove it in the Web UI.': 110,
  'Could not read pairing requests': 111,
  'Nothing to approve': 112,
  'No browser is waiting to pair. Open the Web UI, log in with the gateway password, then run this action.': 113,
  'Could not approve pairing request': 114,
  'Pairing approved': 115,
  'The Web UI reconnects on its own; reload it if it does not.': 116,
  Approved: 117,
  'Who can message your agent directly.\n- Allowlist: only the numbers in Allowed Phone Numbers\n- Open: anyone can message your agent': 118,
  "- Repair config and database: checks OpenClaw's configuration and state, and with Apply recommended repairs on, fixes what it finds\n- Import sessions to SQLite: imports stored session history into OpenClaw's SQLite database, or with Apply changes off, only reports what it would import": 119,
  'Replaces the current gateway password. The old password stops working, and the new one is shown only once.': 120,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
