import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.6.6:0',
  releaseNotes: {
    en_US: `**Bumps**

- OpenClaw → 2026.6.6

**Fixes**

- Provider API keys set via Configure API Credentials are now used by the gateway again.`,
    es_ES: `**Actualizaciones**

- OpenClaw → 2026.6.6

**Correcciones**

- Las claves de API configuradas en «Configurar credenciales de API» vuelven a ser utilizadas por la pasarela.`,
    de_DE: `**Aktualisierungen**

- OpenClaw → 2026.6.6

**Fehlerbehebungen**

- Über „API-Anmeldedaten konfigurieren" festgelegte Anbieter-API-Schlüssel werden vom Gateway wieder verwendet.`,
    pl_PL: `**Aktualizacje**

- OpenClaw → 2026.6.6

**Poprawki**

- Klucze API ustawione w „Konfiguruj poświadczenia API" są ponownie używane przez bramę.`,
    fr_FR: `**Mises à jour**

- OpenClaw → 2026.6.6

**Corrections**

- Les clés API définies via « Configurer les identifiants API » sont de nouveau utilisées par la passerelle.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
