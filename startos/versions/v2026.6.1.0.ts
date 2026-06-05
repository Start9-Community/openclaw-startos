import { VersionInfo } from '@start9labs/start-sdk'

export const v_2026_6_1_0 = VersionInfo.of({
  version: '2026.6.1:0',
  releaseNotes: {
    en_US: 'Update to upstream 2026.6.1',
    es_ES: 'Actualización a upstream 2026.6.1',
    de_DE: 'Update auf Upstream 2026.6.1',
    pl_PL: 'Aktualizacja do upstream 2026.6.1',
    fr_FR: 'Mise à jour vers upstream 2026.6.1',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
