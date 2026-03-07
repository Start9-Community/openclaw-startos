export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting OpenClaw Gateway!': 0,
  'Web Interface': 1,
  'OpenClaw Gateway is ready': 2,
  'OpenClaw Gateway is not ready': 3,

  // interfaces.ts
  'Web UI': 4,
  'The OpenClaw Gateway web interface providing WebChat and control panel': 5,

  // actions/configureApiCredentials.ts
  'Configure API Credentials': 6,
  'Configure your primary and optional fallback AI model, including provider credentials': 7,
  'API Key': 8,
  'Your Anthropic API key from console.anthropic.com': 9,
  'OAuth (Claude Pro/Max)': 10,
  'Access Token': 11,
  'OAuth access token from Claude Pro/Max subscription': 12,
  'Refresh Token': 13,
  'OAuth refresh token (optional)': 14,
  'Your OpenAI API key from platform.openai.com': 15,
  'OAuth (ChatGPT Plus)': 16,
  'OAuth access token from ChatGPT Plus subscription': 17,
  Model: 18,
  'Select the Anthropic model to use': 19,
  Authentication: 20,
  'How to authenticate with Anthropic': 21,
  'Select the OpenAI model to use': 22,
  'How to authenticate with OpenAI': 23,
  'Anthropic (Claude)': 24,
  OpenAI: 25,
  Disabled: 26,
  'Primary LLM': 27,
  'Select your primary AI model and provider': 28,
  'Fallback LLM (Optional)': 29,
  'Select a fallback AI model used when the primary is unavailable (rate limited, auth failure, etc.)': 30,

  // actions/loginToOs.ts
  'StartOS Master Password': 36,
  'Your StartOS server master password': 37,
  'Enter master password': 38,
  'Login to StartOS': 39,
  'Authenticate start-cli with your StartOS server': 40,
  'This will give root access to your StartOS server to this package. Only do this for a server designated for development purposes.': 41,
  'No host configured. The host URL is set automatically from the OS IP address.': 42,
  'Login Successful': 43,
  'start-cli is now authenticated with your StartOS server.': 44,

  // init/loginToOsTask.ts
  'Login to StartOS to enable start-cli authentication': 45,

  // init/initializeService.ts
  'Configure your AI provider credentials to use OpenClaw': 46,

  // main.ts (check-login oneshot)
  'Login to StartOS to enable start-cli authentication for managing the server': 48,

  // actions/connectTelegram.ts
  'Bot Token': 50,
  'Telegram bot token from @BotFather. Create a bot at https://t.me/BotFather and copy the token.': 51,
  'DM Policy': 52,
  'How to handle direct messages from new users': 53,
  'Connect Telegram': 54,
  'Connect a Telegram bot so you can chat with your agent from Telegram. Create a bot with @BotFather first.': 55,
  'Channels': 56,
  'Telegram Connected': 57,
  'Telegram bot configured. Restart the service for changes to take effect. DM your bot to start chatting with your agent.': 58,

  // actions/connectWhatsapp.ts
  'Allowed Phone Numbers': 59,
  'Comma-separated phone numbers in international format (e.g. +15551234567,+15559876543). Only used with Allowlist policy.': 60,
  'Connect WhatsApp': 61,
  'Connect WhatsApp so you can chat with your agent. Links your WhatsApp account via QR code.': 62,
  'WhatsApp login failed': 63,
  'WhatsApp QR Code': 64,
  'Scan this QR code with WhatsApp (Settings > Linked Devices > Link a Device):': 65,

  // actions/setPassword.ts
  'Set Password': 66,
  'Reset Password': 67,
  'Set the gateway password needed to log in to the Control UI': 68,
  'Reset your OpenClaw gateway password': 69,
  'Password Set': 70,
  'Use this password to log in to the OpenClaw Control UI.': 71,

  // init/taskSetPassword.ts
  'Set your OpenClaw gateway password': 72,

  // manifest alerts
  'Use ONLY with EXTREME Caution! Do NOT install OpenClaw on a server containing important services or data. DO NOT install OpenClaw on a server that has Bitcoin keys i.e. LND or CLN. OpenClaw uses an LLM of your choosing allowing it to run commands based on your prompts. In addition to privacy concerns when using OpenAI or Anthropic, OpenClaw can run destructive commands to uninstall other services, or could even brick your server.': 49,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
