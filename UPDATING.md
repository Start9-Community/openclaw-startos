# Updating the upstream version

OpenClaw is installed into the image at build time by the official `openclaw.bot` installer, with the version pinned by the `OPENCLAW_VERSION` build ARG in `Dockerfile`. There is no `dockerTag` in the manifest. The image also bundles the GitHub CLI (`gh`, pinned by `GH_VERSION`) into the in-container workspace, where the OpenClaw agent relies on it.

**Treat `gh` as part of the OpenClaw update, not a separate pin.** Whenever you update OpenClaw, check `gh` in the same pass and bump it too if a newer stable release exists. The two ARGs move together.

## Determining the upstream version

- **OpenClaw** — canonical home: [openclaw/openclaw](https://github.com/openclaw/openclaw) (the `upstreamRepo`).
  ```
  gh release view -R openclaw/openclaw --json tagName -q .tagName
  ```
  Tags are of the form `vYYYY.M.D` (e.g. `v2026.5.18`); strip the leading `v` for the pin. Skip pre-releases (`-beta.N`, `-rc.N`). Pin lives in `Dockerfile` as `OPENCLAW_VERSION`.

- **GitHub CLI (`gh`)** — canonical home: [cli/cli](https://github.com/cli/cli).
  ```
  gh release view -R cli/cli --json tagName -q .tagName
  ```
  Strip the leading `v` for the pin. Pin lives in `Dockerfile` as `GH_VERSION`.

## Applying the bump

- **OpenClaw** — edit `Dockerfile` and update the `OPENCLAW_VERSION` ARG default to the new version (no `v` prefix).
- **GitHub CLI** — edit `Dockerfile` and update the `GH_VERSION` ARG default to the new version (no `v` prefix).

After editing, confirm with `grep -rn '<OLD_VERSION>' --include='*.ts' --include=Dockerfile` that no stale references remain, then bump `version` and update `releaseNotes` in `startos/versions/current.ts` per the package's versioning conventions.

## The baked `start-cli` (`START_CLI_VERSION`)

Separate from OpenClaw and `gh`, the `Dockerfile` downloads a `start-cli` binary for the **Login to StartOS** action, pinned by `START_CLI_VERSION` in `startos/utils.ts` and passed through the manifest's `buildArgs`. It tracks the `start-cli` release line in the [`Start9Labs/start-technologies`](https://github.com/Start9Labs/start-technologies) monorepo — not OpenClaw, and not StartOS itself. It moves on its own schedule, so check it whenever you touch this file.

> [!WARNING]
> **Do not use a bare `gh release view` on that repo.** The monorepo publishes releases for several products under per-product tag prefixes (`start-cli/`, `start-sdk/`, `start-wrt/`, …), so "Latest" may refer to a different product.

Find the latest `start-cli` tag specifically:

```bash
gh release list -R Start9Labs/start-technologies -L 60 --json tagName \
  -q '[.[] | select(.tagName | startswith("start-cli/"))][0].tagName'
```

Set `START_CLI_VERSION` to the version without the `start-cli/v` prefix. The `Dockerfile` builds the product-scoped tag back as `start-cli%2Fv${START_CLI_VERSION}` — the `%2F` is load-bearing, since the tag contains a slash.

The release must publish both Linux architectures this package builds. Verify before pinning:

```bash
gh release view "start-cli/v<version>" -R Start9Labs/start-technologies \
  --json assets -q '.assets[].name' \
  | grep -E '^start-cli_(x86_64|aarch64)-linux$'
```

Finally, check whether the new CLI needs a newer StartOS than the package itself does — **the two floors are independent.** `start-cli` 1.1.0 replaced cookie auth with per-device signing keys, so its `auth login` only works against a StartOS that speaks signature auth, which first shipped in `start-os/v0.4.0`. The package's own floor is the manifest `osVersion`, which start-sdk 2.0 sets to `0.4.0-beta.10` — a version that was never released, since the beta line ends at `beta.9`. So every host that can install this package already clears the CLI's floor, but that is a coincidence of the two numbers, not a rule. Re-derive it on the next CLI bump rather than assuming the SDK's floor covers it.
