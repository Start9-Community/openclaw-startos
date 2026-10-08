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
`instructions.md` (end-user docs) in sync with your changes. This file restates neither:
whoever changes the package has both, so it carries only what they don't — repo mechanics,
a change that looks right and is not, where the next thing gets added, a naming trap, a
build or test invocation particular to this repo.

**Fix a defect you spot rather than reporting it** — you have the package open and the
context to be sure. File **a GitHub issue on this repo** only when the call isn't yours to
make: you can't pin the cause down, two defensible fixes exist, or it's too large to ride on
the work in hand. An open issue is a report, not a queue — implement one when you're asked
to or when it's labelled `Approved`, then close it with `Closes #<n>`.

Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **Keep anything derived from `openclaw.json` reactive.** OpenClaw rewrites the file at runtime (`/model` in chat changes `agents.defaults.model`), so an action is never its only writer.
- **Never move `auth-profiles.json` into `.openclaw/agents/<id>/agent/`.** Doctor archives a file of that name there, and the gateway then refuses an agent whose SQLite store is empty.
- **Don't reintroduce `dangerouslyDisableDeviceAuth` or `allowInsecureAuth`.** Upstream retired them and doctor strips them; `approve-devices` is how a browser gets past "Approve this browser".
- **Keep `gateway.trustedProxies` derived from the bridge address in `main.ts`.** A hard-coded value breaks when the address moves, and OpenClaw then answers the whole UI with `403 proxy_attribution_required`.
- **Never make the `login-to-os` task `critical` or raise it at install, and keep `--allow-unconfigured` on the gateway.** The task grants root-equivalent server control; the flag is what lets the UI start and show what is missing.
- **`configureSynapse.ts` is unfinished and not registered in `actions/index.ts`.** Don't document or enable it without testing.
