# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **`openclaw.json` is co-owned with the application.** OpenClaw rewrites it at runtime — `/model` in chat changes `agents.defaults.model`. That is why `dependencies.ts` reads the model with `.const()` instead of trusting the action to be the only writer; keep any state derived from that file reactive.
- **The health check resolves the service's own bridge address via `sdk.host.getOwn`.** The retired `<pkg>.startos` DNS name no longer resolves between containers; same for reaching sibling services (`simplex.ts`, local backends).
- **`login-to-os` grants root-equivalent server control**, which is why it is `important` and raised only after `check-login` finds `start-cli` unauthenticated — never promote it to `critical` or run it at install.
- **`--allow-unconfigured` keeps the gateway starting before a provider exists**, so the UI can show what is missing. Don't remove it to "fail fast".
- **`configureSynapse.ts` is commented out of `actions/index.ts`** — it is unfinished, not shipped. Don't document it or re-enable it without testing.
