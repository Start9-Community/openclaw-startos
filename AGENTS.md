# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `openclaw`.** OpenClaw Gateway — a personal AI-assistant control plane with a web chat/control UI.
- **One interface**, `ui` (host `ui-multi`), served over HTTP.
- **Bundles `start-cli` inside the container.** Once the *Login to StartOS* action authenticates it, the agent can administer the host (root-equivalent) — security-sensitive; the *Revoke StartOS Access* action removes the stored auth.
- **Optional local-inference backends** (ollama / vllm / llama-cpp) are declared as optional dependencies and reached over the LXC bridge: `configureApiCredentials.ts` resolves each dep's `api` interface (host `api-multi`) at apply time — the retired `<pkg>.startos` DNS no longer resolves between containers.

## Inspecting a running install

To run a command inside the service's container (read its generated config, grep app logs), use `start-cli package attach openclaw -n <name> -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts` — here `openclaw-sub`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers".
