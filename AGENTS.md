# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **`openclaw.json` is co-owned with the application.** OpenClaw rewrites it at runtime — `/model` in chat changes `agents.defaults.model`. That is why `dependencies.ts` reads the model with `.const()` instead of trusting the action to be the only writer; keep any state derived from that file reactive.
- **The health check resolves the service's own bridge address via `sdk.host.getOwn`.** The retired `<pkg>.startos` DNS name no longer resolves between containers; same for reaching sibling services (`simplex.ts`, local backends).
- **`login-to-os` grants root-equivalent server control**, which is why it is `important` and raised only after `check-login` finds `start-cli` unauthenticated — never promote it to `critical` or run it at install.
- **`--allow-unconfigured` keeps the gateway starting before a provider exists**, so the UI can show what is missing. Don't remove it to "fail fast".
- **`configureSynapse.ts` is commented out of `actions/index.ts`** — it is unfinished, not shipped. Don't document it or re-enable it without testing.
