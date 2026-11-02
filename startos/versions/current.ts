import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.9.4:4',
  releaseNotes: {
    en_US:
      "Fixes the llama.cpp backend, which failed with an authentication error on StartOS 0.4.1. OpenClaw now connects to llama.cpp's OpenAI-compatible API interface with its API key. Update llama.cpp first; an existing llama.cpp backend is moved over when OpenClaw starts.",
    es_ES:
      'Corrige el backend llama.cpp, que fallaba con un error de autenticación en StartOS 0.4.1. OpenClaw ahora se conecta a la interfaz API compatible con OpenAI de llama.cpp con su clave de API. Actualice primero llama.cpp; un backend llama.cpp existente se traslada cuando OpenClaw se inicia.',
    de_DE:
      'Behebt das llama.cpp-Backend, das unter StartOS 0.4.1 mit einem Authentifizierungsfehler fehlschlug. OpenClaw verbindet sich jetzt mit der OpenAI-kompatiblen API-Schnittstelle von llama.cpp und deren API-Schlüssel. Aktualisieren Sie zuerst llama.cpp; ein bestehendes llama.cpp-Backend wird beim Start von OpenClaw umgestellt.',
    pl_PL:
      'Naprawia backend llama.cpp, który w StartOS 0.4.1 kończył się błędem uwierzytelniania. OpenClaw łączy się teraz z interfejsem API zgodnym z OpenAI w llama.cpp, używając jego klucza API. Najpierw zaktualizuj llama.cpp; istniejący backend llama.cpp zostanie przeniesiony przy uruchomieniu OpenClaw.',
    fr_FR:
      "Corrige le backend llama.cpp, qui échouait avec une erreur d'authentification sous StartOS 0.4.1. OpenClaw se connecte désormais à l'interface API compatible OpenAI de llama.cpp avec sa clé d'API. Mettez d'abord llama.cpp à jour ; un backend llama.cpp existant est basculé au démarrage d'OpenClaw.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
