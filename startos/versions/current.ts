import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.6.11:0',
  releaseNotes: {
    en_US: `**Bumps**

- OpenClaw → 2026.6.11`,
    es_ES: `**Actualizaciones**

- OpenClaw → 2026.6.11`,
    de_DE: `**Aktualisierungen**

- OpenClaw → 2026.6.11`,
    pl_PL: `**Aktualizacje**

- OpenClaw → 2026.6.11`,
    fr_FR: `**Mises à jour**

- OpenClaw → 2026.6.11`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
