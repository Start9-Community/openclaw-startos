import { VersionInfo } from '@start9labs/start-sdk'

export const v_2026_3_2_1_a0 = VersionInfo.of({
  version: '2026.3.2:1-alpha.0',
  releaseNotes: {
    en_US: 'Fix gateway controlUi configuration for non-loopback binding.',
    es_ES:
      'Corrección de la configuración de controlUi del gateway para enlace no-loopback.',
    de_DE:
      'Korrektur der Gateway-controlUi-Konfiguration für nicht-Loopback-Bindung.',
    pl_PL:
      'Naprawa konfiguracji controlUi bramki dla wiązania nie-loopback.',
    fr_FR:
      "Correction de la configuration controlUi de la passerelle pour la liaison non-loopback.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
