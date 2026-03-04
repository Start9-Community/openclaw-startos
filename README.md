<p align="center">
  <img src="icon.svg" alt="OpenClaw Logo" width="21%">
</p>

# OpenClaw for StartOS

This repository packages [OpenClaw](https://github.com/openclaw/openclaw) for StartOS. This document describes what makes this package different from a default OpenClaw deployment.

For general OpenClaw usage and features, see the [upstream documentation](https://docs.openclaw.ai/).

## How This Differs from Upstream

This package bundles OpenClaw with `start-cli` for direct StartOS server management. The gateway runs with full access to query server state, manage packages, and execute commands on your StartOS system. The web interface is token-authenticated and accessible via StartOS network interfaces.

## Security Warning

**Use ONLY with EXTREME caution.**

- Do NOT install on a server containing important services or data
- Do NOT install on a server with Bitcoin keys (LND, CLN, etc.)
- OpenClaw uses an LLM that can execute commands based on your prompts
- The AI can run destructive commands, uninstall services, or brick your server
- Privacy concerns exist when using OpenAI or Anthropic APIs

This package is intended for **development and experimentation only**.

## Container Runtime

This package runs **1 custom container**:

| Container | Image | Purpose |
|-----------|-------|---------|
| openclaw | Custom build | OpenClaw Gateway with start-cli bundled |

The container includes:
- OpenClaw Gateway binary
- `start-cli` for StartOS server management
- Workspace bootstrap files (SOUL.md, IDENTITY.md, HEARTBEAT.md, MEMORY.md)
- Pre-installed skills directory

## Volumes

| Volume | Contents | Backed Up |
|--------|----------|-----------|
| `main` | All OpenClaw data, credentials, workspace | Yes |

## Install Flow

On installation:
1. Creates directory structure (`.openclaw/agents`, `.openclaw/credentials`, `.openclaw/workspace`)
2. Copies workspace bootstrap files (SOUL.md, IDENTITY.md, HEARTBEAT.md, MEMORY.md)
3. Generates random gateway authentication token
4. Configures start-cli with StartOS server IP
5. Creates task to "Login to StartOS" for start-cli authentication
6. Creates task to "Configure API Credentials" for LLM provider setup

## Configuration Management

### Auto-Configured Settings

On every startup, this package:

| Setting | Value | Purpose |
|---------|-------|---------|
| `start-cli host` | StartOS IP address | Server management connection |
| Gateway auth token | Random 32-byte hex | Web UI authentication |
| Default model | `anthropic/claude-opus-4-5` | Primary LLM |
| Heartbeat | Every 24h, target none | Agent heartbeat schedule |

### User-Configurable Settings

All configuration is done through Actions (see below).

## Network Interfaces

| Interface | Type | Port | Authentication | Description |
|-----------|------|------|----------------|-------------|
| Web UI | ui | 18789 | Token (query param) | Gateway control panel and WebChat |

The interface URL includes the authentication token as a query parameter.

## Actions

### Configure API Credentials

Configure primary and optional fallback LLM providers.

**Providers:**
- Anthropic (Claude): Sonnet 4.5, Opus 4.5, Haiku 3.5
- OpenAI: GPT-4o, GPT-4o Mini, o3, o3 Mini

**Authentication methods:**
- API Key: Standard API key from provider console
- OAuth: Access token from Claude Pro/Max or ChatGPT Plus subscription

### Login to StartOS

Authenticate start-cli with your StartOS server using your master password.

**Warning:** This grants the package root access to your StartOS server. Only use on a server designated for development purposes.

**Required on install** - created as a critical task.

### Connect Telegram

**Group:** Channels

Connect a Telegram bot to chat with your AI agent.

**Prerequisites:** Create a bot with @BotFather first

**Options:**
- Bot Token: From @BotFather
- DM Policy: Pairing (approve code) or Open (anyone can DM)

### Connect WhatsApp

**Group:** Channels

Connect WhatsApp via QR code to chat with your AI agent.

**Requires service to be running.**

**Options:**
- DM Policy: Allowlist (specific numbers) or Open (anyone)
- Allowed Phone Numbers: Comma-separated international format

Returns a QR code to scan with WhatsApp (Settings > Linked Devices > Link a Device).

## Dependencies

None. OpenClaw on StartOS is standalone.

## Backups

All data is backed up:
- `main` volume - credentials, agent state, workspace, accumulated memories

## Health Checks

| Check | Method | Success Condition |
|-------|--------|-------------------|
| Web Interface | Port listening | Port 18789 responds |

**Grace period:** 20 seconds

## Startup Behavior

On each startup, after the gateway is ready:

1. **Check Login**: Verifies start-cli authentication; creates task if not logged in
2. **Server State Snapshot**: Captures server metrics, packages, notifications, network, and disk info to `MEMORY.md`

The server state snapshot includes:
- Server metrics and time
- Package list and stats
- Notifications
- Tor services and network gateways
- Disk list and backup targets

## Limitations

1. **Messaging channels**: Only Telegram and WhatsApp are configured via Actions; other channels (Slack, Discord, Signal, Matrix) require manual configuration
2. **Synapse integration**: Matrix/Synapse bot user creation is implemented but disabled
3. **Voice features**: Voice Wake and Talk Mode not available (requires companion apps)
4. **Browser automation**: Limited without display access
5. **Privacy**: All prompts sent to external AI providers (Anthropic/OpenAI)

## What's Unchanged

- WebChat interface functionality
- AI model interactions
- Workspace and memory system
- Skills and tool execution
- Agent configuration

---

## Quick Reference (YAML)

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
    masked: true

actions:
  - id: configure-api-credentials
    name: Configure API Credentials
    has_input: true
    providers:
      - anthropic (claude-sonnet-4-5, claude-opus-4-5, claude-haiku-3-5)
      - openai (gpt-4o, gpt-4o-mini, o3, o3-mini)
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
  - default model (claude-opus-4-5)
  - workspace bootstrap files

health_checks:
  - name: Web Interface
    method: port_listening
    port: 18789
    grace_period: 20000

install_tasks:
  - Login to StartOS (critical)
  - Configure API Credentials (critical)

not_available:
  - voice_features
  - companion_apps
  - some_messaging_channels (slack, discord, signal via actions)
```
