import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.9.4:2',
  releaseNotes: {
    en_US:
      'Restarting OpenClaw while it is still starting stops every process of the previous run.',
    es_ES:
      'Reiniciar OpenClaw mientras aún se está iniciando detiene todos los procesos de la ejecución anterior.',
    de_DE:
      'Ein Neustart von OpenClaw, während es noch startet, beendet alle Prozesse des vorherigen Laufs.',
    pl_PL:
      'Ponowne uruchomienie OpenClaw w trakcie uruchamiania zatrzymuje wszystkie procesy poprzedniego uruchomienia.',
    fr_FR:
      "Redémarrer OpenClaw pendant son démarrage arrête tous les processus de l'exécution précédente.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
