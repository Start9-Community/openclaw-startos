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

**Use ONLY with EXTREME caution.**

- Do NOT install on a server containing important services or data
- Do NOT install on a server with Bitcoin keys (LND, CLN, etc.)
- OpenClaw uses an LLM that can execute commands based on your prompts
- The AI can run destructive commands, uninstall services, or brick your server
- Privacy concerns exist when using OpenAI or Anthropic APIs

This package is intended for **development and experimentation only**.

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
4. If no API credentials exist: creates **critical task** — "Configure API Credentials"

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
| Gateway auth token | Random 22-character password | Web UI authentication |
| Default model | `anthropic/claude-opus-4-6` | Primary LLM |
| Heartbeat | Every 24h, target none | Agent heartbeat schedule |

### User-Configurable Settings

All configuration is done through Actions (see below).

## Network Access and Interfaces

| Interface | Type | Port | Authentication | Description |
|-----------|------|------|----------------|-------------|
| Web UI | ui | 18789 | Token (query param) | Gateway control panel and WebChat |

The interface URL includes the authentication token as a query parameter.

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

### Configure API Credentials

| Property | Value |
|----------|-------|
| ID | `configure-api-credentials` |
| Availability | Any status |
| Visibility | Enabled |
| Group | None |
| Auto-created | Critical task if no credentials exist |

**Input:** Primary provider (required) and optional fallback provider, each with:
- Provider: Anthropic or OpenAI
- Model selection (Anthropic: Opus 4.6, Sonnet 4.6, Opus 4.5, Sonnet 4.5, Haiku 4.5; OpenAI: GPT-4o, GPT-4o Mini, o3, o3 Mini)
- Auth method: API Key or OAuth (Claude Pro/Max or ChatGPT Plus token)

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

None. OpenClaw on StartOS is standalone.

## Backups and Restore

**Included in backup:** The entire `main` volume — credentials, agent state, workspace, accumulated memories.

**Restore behavior:** All data is restored. Critical tasks for Set Password and Configure API Credentials are re-created if credentials are missing (same as fresh install logic).

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
5. **Privacy**: All prompts sent to external AI providers (Anthropic/OpenAI)

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
    auth: token (query param)
    masked: false

actions:
  - id: configure-api-credentials
    name: Configure API Credentials
    has_input: true
    providers:
      - anthropic (claude-opus-4-6, claude-sonnet-4-6, claude-opus-4-5, claude-sonnet-4-5, claude-haiku-4-5)
      - openai (gpt-4o, gpt-4o-mini, o3, o3-mini)
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

dependencies: []

auto_configure:
  - start-cli host URL
  - gateway auth token
  - default model (claude-opus-4-6)
  - workspace bootstrap files

health_checks:
  - name: Web Interface
    method: checkWebUrl
    port: 18789
    grace_period: 40000

install_tasks:
  - Login to StartOS (critical)
  - Configure API Credentials (critical)

not_available:
  - voice_features
  - companion_apps
  - some_messaging_channels (slack, discord, signal via actions)
```
