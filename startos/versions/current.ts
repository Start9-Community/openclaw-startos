import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.6.10:0',
  releaseNotes: {
    en_US: `**Bumps**

- OpenClaw → 2026.6.10`,
    es_ES: `**Actualizaciones**

- OpenClaw → 2026.6.10`,
    de_DE: `**Aktualisierungen**

- OpenClaw → 2026.6.10`,
    pl_PL: `**Aktualizacje**

- OpenClaw → 2026.6.10`,
    fr_FR: `**Mises à jour**

- OpenClaw → 2026.6.10`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
