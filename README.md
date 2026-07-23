<p align="center">
  <img src="icon.svg" alt="OpenClaw Logo" width="21%">
</p>

# OpenClaw on StartOS

> **Upstream docs:** <https://docs.openclaw.ai/>
>
> Everything not listed in this document should behave the same as upstream
> OpenClaw. If a feature, setting, or behavior is not mentioned
> here, the upstream documentation is accurate and fully applicable.

[OpenClaw](https://github.com/openclaw/openclaw) is an AI agent platform with a gateway that provides WebChat, messaging channel integrations, and tool execution. This package bundles it with `start-cli` for direct StartOS server management.

---

## Table of Contents

- [Security Warning](#security-warning)
- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Dependencies](#dependencies)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Security Warning

**Use with caution.** OpenClaw runs an LLM of your choosing that can execute commands on your behalf.

- On its own, OpenClaw is a chat agent with no access to your server. It gains that access only when you run **Login to StartOS**, which grants it root-equivalent control through the bundled `start-cli`.
- Once granted, the agent can run destructive commands — uninstall services, change configuration — with no built-in confirmation step. Skip Login to StartOS if you want that guardrail, or run **Revoke StartOS Access** afterward to remove the stored authentication.
- Do NOT install on a server holding important data or keys (e.g. LND or CLN).
- With a cloud AI provider, your prompts and context leave the device; choose a local backend (Ollama, vLLM, llama.cpp) to keep inference on your server.

Best suited for **development and experimentation**.

## Image and Container Runtime

This package runs **1 custom container**:

| Container | Image | Purpose |
|-----------|-------|---------|
| openclaw | Custom build | OpenClaw Gateway with start-cli bundled |

The container includes:
- OpenClaw Gateway binary
- `start-cli` for StartOS server management
- Workspace bootstrap files (SOUL.md, IDENTITY.md, HEARTBEAT.md, MEMORY.md)
- Pre-installed skills directory

## Volume and Data Layout

| Volume | Mount Point | Purpose |
|--------|-------------|---------|
| `main` | `/data` | All OpenClaw data, credentials, workspace |

**Key paths on the `main` volume:**

- `.openclaw/` — agent state, credentials, workspace
- `.openclaw/workspace/` — SOUL.md, IDENTITY.md, HEARTBEAT.md, MEMORY.md
- `.startos/` — start-cli configuration

## Installation and First-Run Flow

On install/update/restore:

1. Creates directory structure (`.openclaw/agents`, `.openclaw/credentials`, `.openclaw/workspace`)
2. Deploys workspace bootstrap files (SOUL.md, IDENTITY.md, HEARTBEAT.md, MEMORY.md — preserves existing MEMORY.md)
3. If no password exists: creates **critical task** — "Set Password"
4. If no API credentials exist: creates **critical task** — "Configure AI Provider"

On every startup:

1. Updates `start-cli` config with current StartOS server IP
2. Sets file ownership (`chown` on `/data`)
3. Starts the gateway daemon
4. After gateway is ready: checks `start-cli` login status — creates **important task** "Login to StartOS" if not authenticated
5. Captures a server state snapshot to `MEMORY.md` (server metrics, packages, notifications, network, disk info)

## Configuration Management

### Auto-Configured Settings

On every startup, this package:

| Setting | Value | Purpose |
|---------|-------|---------|
| `start-cli host` | StartOS IP address | Server management connection |
| Heartbeat | Every 24h, target none | Agent heartbeat schedule |

The gateway password and the AI provider/model are **not** auto-configured — they are set by the **Set Password** and **Configure AI Provider** actions (both critical tasks on first install).

### User-Configurable Settings

All configuration is done through Actions (see below).

## Network Access and Interfaces

| Interface | Type | Port | Authentication | Description |
|-----------|------|------|----------------|-------------|
| Web UI | ui | 18789 | Password | Gateway control panel and WebChat |

Log in to the gateway with the password set via the **Set Password** action.

## Actions (StartOS UI)

### Set Password

| Property | Value |
|----------|-------|
| ID | `set-password` |
| Availability | Any status |
| Visibility | Enabled |
| Group | None |
| Input | None |
| Output | Generated 22-character password (masked, copyable) |
| Auto-created | Critical task if no password exists |

Sets or resets the gateway authentication password for the web UI. The action name dynamically changes to "Reset Password" if a password already exists.

### Configure AI Provider

| Property | Value |
|----------|-------|
| ID | `configure-api-credentials` |
| Availability | Any status |
| Visibility | Enabled |
| Group | None |
| Auto-created | Critical task if no credentials exist |

**Input:** Primary provider (required) and optional fallback provider. Each is either a cloud provider or a local backend:
- **Cloud:** Anthropic (Claude), OpenAI (GPT), Google (Gemini), or xAI (Grok) — a per-provider model dropdown plus a **Custom Model** field for any id not listed, and the provider's **API Key** (masked; leave blank when reconfiguring to keep the saved key).
- **Local:** Ollama, vLLM, or llama.cpp running on your StartOS server — enter the served model id. Selecting one flips it to a running dependency and wires its bridge endpoint automatically (vLLM's key is read from its published credentials). No cloud API key, so prompts stay on the device.

The selected model is the default; change it anytime from Web UI chat with the `/model` command. Cloud keys are bridged to the gateway as the env vars OpenClaw reads (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`, `XAI_API_KEY`); local backends are written as `models.providers.<id>` entries in `openclaw.json` pointing at the dependency's LXC-bridge endpoint — resolved at apply time from its `api` interface (host `api-multi`), since the `<pkg>.startos` DNS name no longer resolves between containers (Ollama via its native API, vLLM/llama.cpp OpenAI-compatible).

### Login to StartOS

| Property | Value |
|----------|-------|
| ID | `login-to-os` |
| Availability | Any status |
| Visibility | Enabled |
| Group | None |
| Input | StartOS master password |
| Output | None |
| Auto-created | Important task if start-cli is not authenticated (checked on each startup) |

**Warning:** This grants the package root access to your StartOS server. Only use on a server designated for development purposes.

### Revoke StartOS Access

| Property | Value |
|----------|-------|
| ID | `revoke-startos-access` |
| Availability | Any status |
| Visibility | Enabled |
| Group | None |
| Input | None |
| Output | None |

Removes OpenClaw's stored `start-cli` authentication (the `.cookies.json` saved on the data volume), cutting off server-administration access without uninstalling the service. Run **Login to StartOS** again to grant access back.

### Connect Telegram

| Property | Value |
|----------|-------|
| ID | `connect-telegram` |
| Availability | Any status |
| Visibility | Enabled |
| Group | Channels |
| Output | Confirmation message |

**Input:** Bot token (from @BotFather, required, masked) and DM policy (Pairing or Open).

### Connect WhatsApp

| Property | Value |
|----------|-------|
| ID | `connect-whatsapp` |
| Availability | **Running only** |
| Visibility | Enabled |
| Group | Channels |
| Output | QR code to scan with WhatsApp |

**Input:** DM policy (Allowlist or Open) and allowed phone numbers (comma-separated, international format). Scan the returned QR code with WhatsApp (Settings > Linked Devices > Link a Device).

## Dependencies

All optional and gated by the **Configure AI Provider** selection — cloud providers need none. Selecting a local backend flips the matching package to a **running** dependency (`startos/dependencies.ts`):

| Dependency | Version range | When required |
|------------|---------------|---------------|
| `ollama` | `>=0.21.0:0` | Backend set to Ollama |
| `vllm` | `>=0.16.0:0.1` | Backend set to vLLM |
| `llama-cpp` | `>=1.0.9544:0` | Backend set to llama.cpp |

## Backups and Restore

**Included in backup:** The entire `main` volume — credentials, agent state, workspace, accumulated memories.

**Restore behavior:** All data is restored. Critical tasks for Set Password and Configure AI Provider are re-created if credentials are missing (same as fresh install logic).

## Health Checks

| Check | Method | Success Condition |
|-------|--------|-------------------|
| Web Interface | HTTP check (`checkWebUrl`) | Port 18789 responds |

**Grace period:** 40 seconds

## Limitations and Differences

1. **Messaging channels**: Only Telegram and WhatsApp are configured via Actions; other channels (Slack, Discord, Signal, Matrix) require manual configuration
2. **Synapse integration**: Matrix/Synapse bot user creation is implemented but disabled
3. **Voice features**: Voice Wake and Talk Mode not available (requires companion apps)
4. **Browser automation**: Limited without display access
5. **Privacy**: With a cloud provider (Anthropic, OpenAI, Google, xAI), all prompts are sent to that provider. Choose a local backend (Ollama, vLLM, llama.cpp) to keep inference on your server.

## What Is Unchanged from Upstream

- WebChat interface functionality
- AI model interactions
- Workspace and memory system
- Skills and tool execution
- Agent configuration

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: openclaw
upstream_repo: https://github.com/openclaw/openclaw
containers:
  - name: openclaw
    image: custom (with start-cli)

volumes:
  main:
    backup: true

interfaces:
  ui:
    type: ui
    port: 18789
    auth: password (set via Set Password action)
    masked: false

actions:
  - id: configure-api-credentials
    name: Configure AI Provider
    has_input: true
    providers:
      - anthropic (claude-opus-4-8, claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5, claude-fable-5)
      - openai (gpt-5.5, gpt-5.4, gpt-5.4-mini)
      - google (gemini-3.1-pro-preview, gemini-3-flash-preview)
      - xai (grok-4.3, grok-build-0.1)
      - local: ollama, vllm, llama-cpp (served-model id; models.providers.<id> pointing at <id>'s LXC-bridge api endpoint, resolved at apply time from host api-multi; ollama uses api=ollama, vllm/llama-cpp api=openai-completions)
    custom_model_field: true
    provider_key_envs: [ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, XAI_API_KEY]
  - id: set-password
    name: Set Password
    has_input: false
  - id: login-to-os
    name: Login to StartOS
    has_input: true
    warning: grants root access
  - id: connect-telegram
    name: Connect Telegram
    has_input: true
    group: Channels
  - id: connect-whatsapp
    name: Connect WhatsApp
    has_input: true
    group: Channels

dependencies: # optional; flipped to running by Configure AI Provider
  ollama: ">=0.21.0:0"
  vllm: ">=0.16.0:0.1"
  llama-cpp: ">=1.0.9544:0"

auto_configure:
  - start-cli host URL
  - heartbeat schedule (24h)
  - workspace bootstrap files

health_checks:
  - name: Web Interface
    method: checkWebUrl
    port: 18789
    grace_period: 40000

install_tasks:
  - Set Password (critical)
  - Configure AI Provider (critical)
startup_tasks:
  - Login to StartOS (important, if start-cli is not authenticated)

not_available:
  - voice_features
  - companion_apps
  - some_messaging_channels (slack, discord, signal via actions)
```
