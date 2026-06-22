# OpenClaw

OpenClaw runs an LLM of your choosing. On its own it's a chat agent with no access to your server; if you grant it access (the *Login to StartOS* action) it gains root-equivalent control and can run any command. Install it on a server that holds no other services or keys you can't afford to lose.

## Documentation

- [Messaging channels](https://docs.openclaw.ai/channels) — connecting Telegram, WhatsApp, and other chat platforms to your agent.
- [Personality and identity](https://docs.openclaw.ai/pi) — shaping how your agent behaves through the workspace files (SOUL, IDENTITY, MEMORY, HEARTBEAT).
- [Tools](https://docs.openclaw.ai/tools) — the toolset the agent can call.
- [Models](https://docs.openclaw.ai/models) — supported LLM providers and how model selection and fallback work.
- [Gateway](https://docs.openclaw.ai/gateway) — the control panel and WebChat that this package exposes.

## What you get on StartOS

- **The OpenClaw Gateway**, served over the **Web UI** interface — a browser-based control panel and WebChat where you talk to your agent.
- **`start-cli` bundled in the container**, so once you authenticate the package (see *Login to StartOS* below) the agent can manage your StartOS server directly: read service status, install or remove packages, send notifications, and so on.
- **Workspace files preserved across upgrades.** SOUL, IDENTITY, MEMORY, and HEARTBEAT live on the package's `main` volume; MEMORY is preserved on updates while the others are kept in sync with package defaults.
- **A persistent server snapshot in MEMORY.md** captured on each startup so the agent has fresh context about the host it's running on.

## Getting set up

1. Open OpenClaw's **Dashboard** tab. On a fresh install you'll see two critical tasks waiting: **Set Password** and **Configure AI Provider**. Complete them in either order — both are required before you can use the gateway.
2. Run **Set Password**. The action generates a 22-character password and shows it once, masked and copyable; save it now in your password manager — you'll need it to log in to the Web UI. (The action becomes **Reset Password** after a password is set.)
3. Run **Configure AI Provider** and pick your primary backend:
   - **Cloud** — Anthropic (Claude), OpenAI (GPT), Google (Gemini), or xAI (Grok): choose a default model (or type any id into the **Custom Model** field) and paste the provider's API key.
   - **Local** — Ollama, vLLM, or llama.cpp running on your StartOS server: enter the served model id. Selecting one adds it as a dependency (install it from the Marketplace if you haven't) and wires it automatically — no cloud key needed, and prompts stay on your server.

   Optionally add a fallback provider, used automatically when the primary is rate-limited or unavailable. Change the model anytime from Web UI chat with the `/model` command.
4. Open the **Web UI** interface from the Dashboard and log in with the password from **Set Password**. Confirm the WebChat loads and that you can send a prompt.
5. Once the gateway is running you'll see an additional task: **Login to StartOS**. Run it to authenticate the bundled `start-cli` with your server — this is what lets the agent act on the host. The action asks for your StartOS master password. **This grants the agent root-equivalent access to your server. Only do this on a machine you treat as expendable.**

## Using OpenClaw

### Web UI

The Web UI is the OpenClaw Gateway control panel and WebChat. You'll land in a chat surface backed by whichever model you configured; the gateway also exposes channel status, agent configuration, and the workspace files described in the upstream documentation.

### Channels

OpenClaw can listen on several messaging platforms in addition to the Web UI. Two are wired up as StartOS actions; the rest are configured through the upstream channels documentation.

- **Connect Telegram** — paste a bot token from [@BotFather](https://t.me/BotFather), pick a DM policy (Pairing approves new senders with a one-time code, Open accepts anyone), and restart the service for the change to take effect. After that, DM the bot to chat with your agent.
- **Connect WhatsApp** — pick a DM policy (Allowlist with comma-separated phone numbers in international format, or Open) and run the action; it returns a QR code. Scan it from WhatsApp under **Settings → Linked Devices → Link a Device**. The service must be running to run this action.

### Configuration actions

- **Reset Password** — re-runs Set Password to rotate the gateway auth token. The new password is shown once.
- **Configure AI Provider** — re-run any time to switch providers, change models, rotate API keys, or add/remove a fallback. The form is pre-filled with your current provider and model; API keys are never shown, so leave a key blank to keep the one already saved.
- **Login to StartOS** — re-run if `start-cli` ever loses its session (a task automatically reappears on the Dashboard if the package detects it isn't authenticated).

## Limitations

- **Privacy.** With a cloud provider (Anthropic, OpenAI, Google, xAI), every prompt is forwarded to that provider — treat anything you type as visible to them. Choose a local backend (Ollama, vLLM, llama.cpp) to keep inference on your server.
- **Destructive capability.** Once **Login to StartOS** is complete the agent can run commands that uninstall services, change configuration, or render the server unusable. There is no built-in confirmation step; if you want a guardrail, don't run Login to StartOS.
- **Voice features and browser automation** advertised in the upstream docs are not available in this package — there is no companion app and no display attached to the container.
- **Channels beyond Telegram and WhatsApp** (Slack, Discord, Signal, Matrix, etc.) are not wired into StartOS actions. Configure them by editing the gateway configuration following the upstream channels documentation.
