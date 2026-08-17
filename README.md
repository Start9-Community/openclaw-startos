<p align="center">
  <img src="icon.png" alt="OpenClaw Logo" width="21%">
</p>

# OpenClaw on StartOS

> Everything not listed in this document should behave the same as upstream
> OpenClaw. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[OpenClaw](https://github.com/openclaw/openclaw) is a self-hosted AI agent gateway: a web chat and control panel in front of an LLM, reachable from messaging channels, with a workspace and memory of its own. This package runs the gateway, wires it to either a cloud provider or a local model server on the same box, and can — if you ask it to — give the agent administrative control of StartOS itself.

- **Upstream repo:** <https://github.com/openclaw/openclaw>
- **Wrapper repo:** <https://github.com/Start9-Community/openclaw-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One image, built here.

| Property      | Value                               |
| ------------- | ----------------------------------- |
| Image         | Built from this repo's `Dockerfile` |
| Architectures | x86_64, aarch64                     |
| Command       | The gateway, bound to the LAN       |

| Subcontainer   | Purpose                                  |
| -------------- | ---------------------------------------- |
| `openclaw-sub` | The only daemon — the one to `attach` to |

**The image also installs `start-cli`**, pinned to a version by a build argument. That binary is what lets the agent administer the server when you grant it access, and it is why the container needs StartOS's root certificate.

Two oneshots run before the daemon, and three after it:

| Oneshot                 | When   | Purpose                                                    |
| ----------------------- | ------ | ---------------------------------------------------------- |
| `install-root-ca`       | Before | Installs StartOS's root CA so the container trusts the OS  |
| `chown`                 | Before | Hands `/data` to the unprivileged user the gateway runs as |
| `check-login`           | After  | Raises a task if `start-cli` is not authenticated          |
| `check-simplex-plugin`  | After  | Brings the SimpleX plugin up to the pinned version         |
| `server-state-snapshot` | After  | Writes a server inventory into the agent's memory file     |

**The gateway starts unconfigured on purpose.** It is launched with the flag that allows that, so the interface comes up and shows you what is missing rather than refusing to start.

## Volume and Data Layout

One volume, holding the agent and everything it knows.

| Volume | Mount Point | Purpose                 |
| ------ | ----------- | ----------------------- |
| `main` | `/data`     | The agent's entire home |

| Path                                             | Written by  | Holds                                   |
| ------------------------------------------------ | ----------- | --------------------------------------- |
| `.openclaw/openclaw.json`                        | Actions     | The gateway and agent configuration     |
| `.openclaw/agents/main/agent/auth-profiles.json` | An action   | Provider API keys                       |
| `.openclaw/workspace/`                           | Both        | The agent's identity, memory, and files |
| `.startos/config.yaml`                           | The package | Where `start-cli` points                |
| `simplex.json`                                   | An action   | Whether SimpleX file exchange is on     |

**`SOUL.md`, `IDENTITY.md` and `HEARTBEAT.md` are re-copied from the image on every install and upgrade**, so an upstream revision of the agent's own instructions reaches an existing install. **`MEMORY.md` is not** — it is seeded once and then left alone, because it is what the agent has accumulated.

**Every start rewrites one section of `MEMORY.md`**: a snapshot of the server's metrics, packages, notifications, gateways, disks, and backup targets. It is how the agent knows what it is running on — and it means the memory file contains an inventory of your server.

## File Models

Four models, each owning a different boundary.

| File                 | Format | Modelled                | Written by                         |
| -------------------- | ------ | ----------------------- | ---------------------------------- |
| `openclaw.json`      | JSON   | Yes — `FileHelper.json` | Actions, init, and OpenClaw itself |
| `auth-profiles.json` | JSON   | Yes — `FileHelper.json` | An action                          |
| `config.yaml`        | YAML   | Yes — `FileHelper.yaml` | `main` and init                    |
| `simplex.json`       | JSON   | Yes — `FileHelper.json` | An action                          |

**The main configuration is shared with the application, not owned by the package.** OpenClaw edits it too — changing the model from inside the chat writes to the same file — which is why the dependency declaration reads it reactively rather than trusting the action to be the only writer.

Four gateway settings are **pinned** with `z.literal(true)`: the control UI being enabled, insecure auth being allowed, the host-header origin fallback, and device auth being disabled. Those are not casual choices, and the reason is structural: **StartOS fronts the gateway with its own reverse proxy on addresses that OpenClaw's origin and device checks reject.** With them on, the interface simply refuses to authenticate. What remains in front of the gateway is its password — see [Network Access and Interfaces](#network-access-and-interfaces).

**API keys are stored in one place and consumed in another.** The action writes them into the auth-profiles file; OpenClaw reads them from the environment. `main` bridges the two at start, so a key added by the action reaches the gateway on the restart that follows.

The `start-cli` configuration is rewritten at every start with the server's current address, so the agent's administrative tooling follows the box rather than a value recorded at install.

## Dependencies

Four, all optional, and **each declared only while it is selected**.

| Dependency               | Required             | Kind      | Why                           |
| ------------------------ | -------------------- | --------- | ----------------------------- |
| Ollama                   | No — only if chosen  | `running` | Local inference backend       |
| vLLM                     | No — only if chosen  | `running` | Local inference backend       |
| llama.cpp                | No — only if chosen  | `running` | Local inference backend       |
| SimpleX Websocket Bridge | No — only if enabled | `running` | Exchanging files over SimpleX |

**The inference dependency follows the model you are actually using.** The declaration is derived from the primary model and its fallbacks, so selecting a local backend adds it and switching to a cloud provider drops it — including when the switch is made from inside the chat rather than through the action. Each is required to be running _and_ passing its own health check, since an unhealthy model server is the same as an absent one.

**A cloud provider needs no dependency at all**, only an API key and internet.

Local backends are reached over the internal bridge, and their API key is read directly out of the backend's own published volume rather than being asked for again.

SimpleX is different in kind: enabling it mounts the bridge's file-exchange directories into this container so the two can hand files to each other, and resolves the bridge's control socket over the bridge network.

## Network Access and Interfaces

One interface.

| Interface | Id   | Type | Port  | Description                    |
| --------- | ---- | ---- | ----- | ------------------------------ |
| Web UI    | `ui` | ui   | 18789 | The chat and the control panel |

Bound on the `ui-multi` MultiHost over HTTP and not masked.

**The gateway password is the only gate.** OpenClaw's device authentication and origin checking are turned off for the reason given under [File Models](#file-models), so anyone who can reach this address and knows the password has the agent — and, if StartOS access has been granted, the server. A `critical` task blocks the service from starting until that password is set, so there is no window where it is reachable without one.

Outbound, the gateway talks to whichever provider is configured, to any messaging channel you connect, and — for local backends and SimpleX — to the sibling service over the internal bridge.

## Installation and First-Run Flow

Install creates the agent's directory structure, seeds its workspace from the image, points `start-cli` at the server, and pins the gateway settings. It then raises **two `critical` tasks**: set a gateway password, and configure an AI provider.

**Neither can be skipped** — `critical` blocks startup, and an agent with no model and no password is not a usable state.

Once running, the gateway comes up on its interface and two more things happen automatically: it checks whether `start-cli` is authenticated and raises a task if not, and it writes the server snapshot into the agent's memory.

**Granting StartOS access is opt-in and deliberately not a critical task.** It is offered only after the gateway is up and only because the agent could not authenticate — see the action below before running it.

## Actions

Seven actions.

### Set Gateway Password

Generates the password for the web interface and shows it once.

- **What it changes:** the password in the configuration.
- **Cost:** the service restarts.
- **Repeat safety:** each run generates a **new** password and invalidates the old one.

### Configure AI Provider

Chooses the backend — a cloud provider with an API key, or a local model server — plus the model and an optional fallback.

- **What it changes:** the API key in the auth-profiles file, the model selection in the configuration, and for a local backend, a provider entry pointing at that service's endpoint on the internal bridge.
- **Cost:** the service restarts, and the dependency set changes to match.
- **Repeat safety:** idempotent, pre-filled with the current selection.
- **Choosing a local backend makes that package a required dependency**; choosing a cloud provider removes it.

### Connect Telegram

Enables the Telegram channel with a bot token and a policy for who may direct-message the agent.

### Connect WhatsApp

Enables the WhatsApp channel with a DM policy and an allow-list of numbers.

- **Requires the service to be running**, since pairing happens against the live gateway.

### Configure SimpleX

Enables the SimpleX channel and its DM policy, and turns file exchange with the bridge on or off.

- **What it changes:** the channel configuration, the plugin policy, and whether the bridge's directories are mounted.
- It repairs the plugin's enablement and allow-list entries when it skips an install because the plugin is already current — an installed plugin still has to be enabled and named to load.

### Login to StartOS

Authenticates the agent's `start-cli` against this server, using your StartOS master password.

- **This grants the agent root-equivalent control of the server.** It can then start and stop packages, read logs, change network settings, and run backups. The action's own warning says to do it only on a server designated for development, and that warning should be taken literally.
- **What it changes:** a `start-cli` session stored on the volume.
- Everything that reaches the chat can then reach the server, which makes the gateway password and the channel DM policies load-bearing for the whole box.

### Revoke StartOS Access

Removes that session.

- **What it changes:** the stored authentication, deleted.
- The agent keeps working; it just cannot administer the server until you log in again.

## Tasks

Three, two of them blocking.

| Task                  | Severity    | Raised when                                       | Cleared when    |
| --------------------- | ----------- | ------------------------------------------------- | --------------- |
| Set Gateway Password  | `critical`  | Any init that finds no password                   | The action runs |
| Configure AI Provider | `critical`  | Install with no credentials stored                | The action runs |
| Login to StartOS      | `important` | A start-up that finds `start-cli` unauthenticated | The action runs |

`critical` blocks the service from starting, so a fresh install shows the two setup tasks and nothing else. `important` is advisory — the login task appears every start until it is either done or ignored, and ignoring it is a legitimate choice.

## Health Checks

One check, on the only daemon.

| Check     | Displayed as    | Method                                 | Grace |
| --------- | --------------- | -------------------------------------- | ----- |
| `primary` | "Web Interface" | The gateway answers on its own address | 40s   |

**It queries the gateway over the internal bridge** using the service's own resolved address rather than a hostname, so it survives the address changing and does not depend on name resolution between containers.

It reports that the gateway is serving. **It says nothing about the model**: a wrong API key, a rate limit, or a local backend that is running but not loaded all show a green check and an error in the chat.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. That is the whole agent: configuration, provider API keys, the gateway password, channel tokens, the workspace, and the accumulated memory.

**The backup contains every credential the agent holds**, in recoverable form: provider keys, the Telegram bot token, and — if StartOS access was granted — the session that administers your server. Treat it accordingly.

It also contains the server snapshot written into memory, which is an inventory of what is installed on this box.

A restored instance comes back configured and remembers what it knew. The `start-cli` address is rewritten to the new server on the first start, but the **session is not** — an agent restored onto a different server has to be logged in again before it can administer that one.

## Limitations and Differences

1. **Granting StartOS access gives the agent root-equivalent control of the server.** It is optional and revocable, and it is the single most consequential thing this package can do.
2. **Device authentication and origin checking are disabled**, because StartOS's addresses do not satisfy them. The gateway password is the only gate.
3. **The backup holds every credential**, including the server session.
4. **The configuration is co-owned with the application**, which edits it at runtime — a change made in the chat is as real as one made through an action.
5. **The agent's memory contains a server inventory**, rewritten every start.
6. **Local backends must be running and healthy**, or the gateway has no model.
7. **A cloud provider sends your conversations to that provider.** Only a local backend keeps them on the box.
8. **`SOUL.md`, `IDENTITY.md` and `HEARTBEAT.md` are overwritten on every upgrade**; edits to them do not survive.
9. **One agent.** The package configures the default agent only.

---

## Quick Reference for AI Consumers

```yaml
package_id: openclaw
image: built from ./Dockerfile # also installs a pinned start-cli binary
architectures:
  - x86_64
  - aarch64
subcontainers:
  - openclaw-sub # gateway runs as `node`; oneshots that chown run as root
volumes:
  main: /data # HOME and OPENCLAW_STATE_DIR both live here
file_models:
  - .openclaw/openclaw.json # gateway + agent config; OpenClaw writes it too
  - .openclaw/agents/main/agent/auth-profiles.json # provider API keys
  - .startos/config.yaml # start-cli host, rewritten each start
  - simplex.json # whether SimpleX file exchange is enabled
startos_managed_env_vars:
  - HOME
  - OPENCLAW_STATE_DIR
  - NODE_EXTRA_CA_CERTS
  - ANTHROPIC_API_KEY # bridged from auth-profiles.json when present
  - OPENAI_API_KEY
  - GEMINI_API_KEY
  - XAI_API_KEY
dependencies:
  - ollama # optional, kind: running + primary health check, only while selected
  - vllm # same
  - llama-cpp # same
  - simplex-websocket-bridge # optional, only while file exchange is enabled
interfaces:
  ui: { type: ui, port: 18789 } # gateway password is the only gate
actions:
  - set-password
  - configure-api-credentials
  - connect-telegram
  - connect-whatsapp # only-running
  - configure-simplex
  - login-to-os # grants root-equivalent StartOS control
  - revoke-startos-access
tasks:
  - { action: set-password, severity: critical } # reactive
  - { action: configure-api-credentials, severity: critical } # install
  - { action: login-to-os, severity: important } # raised at start when unauthenticated
health_checks:
  - primary # checkWebUrl against the service's own bridge address; says nothing about the model
```
