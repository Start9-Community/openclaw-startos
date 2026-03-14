import { VersionInfo } from '@start9labs/start-sdk'

export const v_2026_3_13_0_b0 = VersionInfo.of({
  version: '2026.3.13:0-beta.0',
  releaseNotes: {
    en_US:
      'Update to upstream 2026.3.13: Dashboard v2 chat UI freeze fix, Gateway RPC timeout fix, plugin-sdk shared chunk deduplication (memory fix), Ollama reasoning model leak fix, security hardening (single-use pairing codes, exec approval, content marker sanitization, Telegram webhook auth), Chrome DevTools MCP attach mode, built-in browser profiles, OPENCLAW_TZ env var, pi-agent packages bumped to 0.58.0.',
    es_ES:
      'Actualización a upstream 2026.3.13: corrección de congelamiento del chat en Dashboard v2, corrección de timeout RPC del Gateway, deduplicación de chunks compartidos en plugin-sdk (corrección de memoria), corrección de fuga del modelo de razonamiento Ollama, endurecimiento de seguridad (códigos de emparejamiento de un solo uso, aprobación de ejecución, sanitización de marcadores de contenido, autenticación de webhook de Telegram), modo de adjuntar MCP de Chrome DevTools, perfiles de navegador integrados, variable de entorno OPENCLAW_TZ, paquetes pi-agent actualizados a 0.58.0.',
    de_DE:
      'Update auf Upstream 2026.3.13: Dashboard-v2-Chat-UI-Einfrierungsfix, Gateway-RPC-Timeout-Fix, Plugin-SDK-Shared-Chunk-Deduplizierung (Speicherfix), Ollama-Reasoning-Modell-Leck-Fix, Sicherheitshärtung (Einmalnutzungs-Pairing-Codes, Exec-Genehmigung, Content-Marker-Bereinigung, Telegram-Webhook-Auth), Chrome-DevTools-MCP-Attach-Modus, integrierte Browserprofile, OPENCLAW_TZ-Umgebungsvariable, pi-agent-Pakete auf 0.58.0 aktualisiert.',
    pl_PL:
      'Aktualizacja do upstream 2026.3.13: naprawa zawieszania czatu Dashboard v2, naprawa timeoutu RPC Gateway, deduplikacja współdzielonych chunków plugin-sdk (naprawa pamięci), naprawa wycieku modelu rozumowania Ollama, wzmocnienie bezpieczeństwa (jednorazowe kody parowania, zatwierdzanie exec, sanityzacja znaczników treści, uwierzytelnianie webhook Telegram), tryb podłączania MCP Chrome DevTools, wbudowane profile przeglądarki, zmienna środowiskowa OPENCLAW_TZ, pakiety pi-agent zaktualizowane do 0.58.0.',
    fr_FR:
      "Mise à jour vers upstream 2026.3.13 : correction du gel du chat Dashboard v2, correction du timeout RPC Gateway, déduplication des chunks partagés plugin-sdk (correction mémoire), correction de fuite du modèle de raisonnement Ollama, renforcement de la sécurité (codes d'appairage à usage unique, approbation exec, assainissement des marqueurs de contenu, authentification webhook Telegram), mode d'attachement MCP Chrome DevTools, profils de navigateur intégrés, variable d'environnement OPENCLAW_TZ, paquets pi-agent mis à jour vers 0.58.0.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
