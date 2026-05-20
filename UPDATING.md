# Updating the upstream version

OpenClaw is installed into the image at build time by the official `openclaw.bot` installer, with the version pinned by the `OPENCLAW_VERSION` build ARG in `Dockerfile`. There is no `dockerTag` in the manifest. The image also pins `GH_VERSION` (GitHub CLI), which is bundled for the in-container workspace.

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

After editing, confirm with `grep -rn '<OLD_VERSION>' --include='*.ts' --include=Dockerfile` that no stale references remain, then bump `version` and update `releaseNotes` in the current `startos/versions/*.ts` file per the package's versioning conventions.
