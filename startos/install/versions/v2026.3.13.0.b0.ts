import { VersionInfo } from '@start9labs/start-sdk'

export const v_2026_3_13_0_b0 = VersionInfo.of({
  version: '2026.3.13:0-beta.0',
  releaseNotes: {
    en_US:
      'Update to upstream 2026.3.12: refreshed Control UI dashboard, fast mode for OpenAI/Anthropic, provider-plugin architecture for Ollama/vLLM/SGLang, security fixes for device pairing and exec detection, file model resilience improvements.',
    es_ES:
      'Actualización a upstream 2026.3.12: panel de Control UI renovado, modo rápido para OpenAI/Anthropic, arquitectura de plugins para Ollama/vLLM/SGLang, correcciones de seguridad para emparejamiento y detección de ejecución, mejoras de resiliencia del modelo de archivos.',
    de_DE:
      'Update auf Upstream 2026.3.12: erneuertes Control-UI-Dashboard, Schnellmodus für OpenAI/Anthropic, Plugin-Architektur für Ollama/vLLM/SGLang, Sicherheitskorrekturen für Gerätekopplung und Ausführungserkennung, Verbesserungen der Dateimodell-Resilienz.',
    pl_PL:
      'Aktualizacja do upstream 2026.3.12: odświeżony panel Control UI, tryb szybki dla OpenAI/Anthropic, architektura wtyczek dla Ollama/vLLM/SGLang, poprawki bezpieczeństwa parowania urządzeń i wykrywania wykonania, ulepszenia odporności modelu plików.',
    fr_FR:
      "Mise à jour vers upstream 2026.3.12 : tableau de bord Control UI rafraîchi, mode rapide pour OpenAI/Anthropic, architecture de plugins pour Ollama/vLLM/SGLang, correctifs de sécurité pour l'appairage et la détection d'exécution, améliorations de la résilience du modèle de fichiers.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
