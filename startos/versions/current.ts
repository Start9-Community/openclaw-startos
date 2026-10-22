import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.9.4:3',
  releaseNotes: {
    en_US: 'Updates Node.js to 26.12.1 with security fixes.',
    es_ES: 'Actualiza Node.js a 26.12.1 con correcciones de seguridad.',
    de_DE: 'Aktualisiert Node.js auf 26.12.1 mit Sicherheitskorrekturen.',
    pl_PL: 'Aktualizuje Node.js do wersji 26.12.1 z poprawkami bezpieczeństwa.',
    fr_FR: 'Met à jour Node.js vers 26.12.1 avec des correctifs de sécurité.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
