import { VersionInfo } from '@start9labs/start-sdk'

export const v_2026_3_2_4_b0 = VersionInfo.of({
  version: '2026.3.2:4-beta.0',
  releaseNotes: {
    en_US:
      'Redesign gateway auth: password-based login with critical task for initial setup, updated model defaults to Claude Opus 4.6, removed synapse dependency.',
    es_ES:
      'Rediseño de autenticación del gateway: inicio de sesión con contraseña con tarea crítica para configuración inicial, modelos actualizados a Claude Opus 4.6, eliminada dependencia de synapse.',
    de_DE:
      'Neugestaltung der Gateway-Authentifizierung: Passwort-basierte Anmeldung mit kritischer Aufgabe für Ersteinrichtung, aktualisierte Modelle auf Claude Opus 4.6, Synapse-Abhängigkeit entfernt.',
    pl_PL:
      'Przeprojektowanie uwierzytelniania bramy: logowanie hasłem z zadaniem krytycznym do początkowej konfiguracji, zaktualizowane modele do Claude Opus 4.6, usunięto zależność od synapse.',
    fr_FR:
      "Refonte de l'authentification du gateway : connexion par mot de passe avec tâche critique pour la configuration initiale, modèles mis à jour vers Claude Opus 4.6, dépendance synapse supprimée.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
