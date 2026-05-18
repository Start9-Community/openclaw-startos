import { VersionInfo } from '@start9labs/start-sdk'

export const v_2026_5_12_1 = VersionInfo.of({
  version: '2026.5.12:1',
  releaseNotes: {
    en_US:
      'Trusts the StartOS root CA so the gateway can reach other StartOS services over HTTPS.',
    es_ES:
      'Confía en la CA raíz de StartOS para que la puerta de enlace pueda acceder a otros servicios de StartOS por HTTPS.',
    de_DE:
      'Vertraut der StartOS-Root-CA, damit das Gateway andere StartOS-Dienste über HTTPS erreichen kann.',
    pl_PL:
      'Ufa głównemu CA StartOS, aby brama mogła łączyć się z innymi usługami StartOS przez HTTPS.',
    fr_FR:
      'Fait confiance à l’AC racine de StartOS pour que la passerelle puisse atteindre d’autres services StartOS via HTTPS.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
