import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.6.11:2',
  releaseNotes: {
    en_US:
      'Updated the bundled GitHub CLI (`gh`) to 2.96.0, which the OpenClaw agent uses for repository work. OpenClaw itself is unchanged and remains on 2026.6.11.',
    es_ES:
      'Actualiza la CLI de GitHub (`gh`) incluida a la versión 2.96.0, que el agente de OpenClaw utiliza para trabajar con repositorios. OpenClaw en sí no cambia y se mantiene en la versión 2026.6.11.',
    de_DE:
      'Aktualisiert die mitgelieferte GitHub-CLI (`gh`) auf 2.96.0, die der OpenClaw-Agent für die Arbeit mit Repositories verwendet. OpenClaw selbst bleibt unverändert bei 2026.6.11.',
    pl_PL:
      'Aktualizuje dołączone narzędzie GitHub CLI (`gh`) do wersji 2.96.0, z którego agent OpenClaw korzysta przy pracy z repozytoriami. Sam OpenClaw pozostaje bez zmian w wersji 2026.6.11.',
    fr_FR:
      "Met à jour l'interface en ligne de commande GitHub (`gh`) incluse vers la version 2.96.0, utilisée par l'agent OpenClaw pour travailler sur les dépôts. OpenClaw lui-même reste inchangé, en version 2026.6.11.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
