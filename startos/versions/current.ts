import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.9.4:5',
  releaseNotes: {
    en_US: `Updates Node.js to 26.13.1 with the November 2026 security fixes.`,
    es_ES: `Actualiza Node.js a 26.13.1 con las correcciones de seguridad de noviembre de 2026.`,
    de_DE: `Aktualisiert Node.js auf 26.13.1 mit den Sicherheitskorrekturen vom November 2026.`,
    pl_PL: `Aktualizuje Node.js do wersji 26.13.1 z poprawkami bezpieczeństwa z listopada 2026 r.`,
    fr_FR: `Met à jour Node.js vers 26.13.1 avec les correctifs de sécurité de novembre 2026.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
