import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.7.1:7',
  releaseNotes: {
    en_US: `Updated OpenClaw to its 2026.7.1-2 correction release, which fixes installing and updating tracked official plugins under newer npm clients. The bundled GitHub CLI is now 2.97.0.`,
    es_ES: `Se actualizó OpenClaw a su versión correctiva 2026.7.1-2, que corrige la instalación y actualización de los complementos oficiales bajo clientes npm más recientes. La CLI de GitHub incluida ahora es 2.97.0.`,
    de_DE: `OpenClaw wurde auf die Korrekturversion 2026.7.1-2 aktualisiert, die das Installieren und Aktualisieren offizieller Plugins unter neueren npm-Clients behebt. Die mitgelieferte GitHub-CLI ist jetzt 2.97.0.`,
    pl_PL: `Zaktualizowano OpenClaw do wydania poprawkowego 2026.7.1-2, które naprawia instalowanie i aktualizowanie oficjalnych wtyczek w nowszych klientach npm. Dołączone CLI GitHuba ma teraz wersję 2.97.0.`,
    fr_FR: `OpenClaw a été mis à jour vers sa version corrective 2026.7.1-2, qui corrige l'installation et la mise à jour des plugins officiels suivis avec les clients npm récents. Le CLI GitHub intégré passe à 2.97.0.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
