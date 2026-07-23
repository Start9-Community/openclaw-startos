import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.7.1:0',
  releaseNotes: {
    en_US: `Updated OpenClaw to 2026.7.1.

This release also migrates the package to start-sdk 2.0 (requires StartOS 0.4.0-beta.10 or later).

See https://openclaw.bot for release details.`,
    es_ES: `Actualiza OpenClaw a 2026.7.1.

Esta versión también migra el paquete a start-sdk 2.0 (requiere StartOS 0.4.0-beta.10 o posterior).

Consulta https://openclaw.bot para conocer los detalles de la versión.`,
    de_DE: `Aktualisiert OpenClaw auf 2026.7.1.

Diese Version stellt das Paket außerdem auf start-sdk 2.0 um (erfordert StartOS 0.4.0-beta.10 oder neuer).

Weitere Informationen zur Version unter https://openclaw.bot.`,
    pl_PL: `Aktualizuje OpenClaw do 2026.7.1.

Ta wersja przenosi też pakiet na start-sdk 2.0 (wymaga StartOS 0.4.0-beta.10 lub nowszego).

Szczegóły wydania: https://openclaw.bot.`,
    fr_FR: `Met à jour OpenClaw vers 2026.7.1.

Cette version fait également passer le paquet à start-sdk 2.0 (nécessite StartOS 0.4.0-beta.10 ou une version ultérieure).

Voir https://openclaw.bot pour les détails de la version.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
