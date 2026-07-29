import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.7.1:5',
  releaseNotes: {
    en_US: `Fixes Login to StartOS. The bundled start-cli was a pre-release build that authenticated with cookies, which supported StartOS hosts reject; it is now start-cli 1.1.0 and its signing-key authentication. Revoke StartOS Access now un-enrolls that key from the server as well as deleting it from OpenClaw's data volume.

Enables file exchange for the SimpleX channel.

The Configure SimpleX action now installs openclaw-simplex 1.8.0 or later and wires the bridge's shared file directories into OpenClaw, so agents can send and receive files over SimpleX.

Already using SimpleX? This update won't apply itself — open the Configure SimpleX action, make sure it is Enabled, and click Submit to upgrade the plugin and apply file exchange.`,
    es_ES: `Corrige «Iniciar sesión en StartOS». El start-cli incluido era una versión preliminar que se autenticaba mediante cookies, algo que los hosts de StartOS compatibles rechazan; ahora es start-cli 1.1.0 con su autenticación mediante claves de firma. «Revocar acceso a StartOS» ahora también anula el registro de esa clave en el servidor, además de eliminarla del volumen de datos de OpenClaw.

Habilita el intercambio de archivos para el canal de SimpleX.

La acción «Configurar SimpleX» ahora instala openclaw-simplex 1.8.0 o posterior y conecta los directorios de archivos compartidos del puente con OpenClaw, para que los agentes puedan enviar y recibir archivos a través de SimpleX.

¿Ya usas SimpleX? Esta actualización no se aplica sola: abre la acción «Configurar SimpleX», asegúrate de que esté habilitada y haz clic en Enviar para actualizar el complemento y aplicar el intercambio de archivos.`,
    de_DE: `Behebt „Bei StartOS anmelden“. Das enthaltene start-cli war ein Vorabversions-Build, der sich mit Cookies authentifizierte – was unterstützte StartOS-Hosts ablehnen; es ist jetzt start-cli 1.1.0 mit dessen Signaturschlüssel-Authentifizierung. „StartOS-Zugriff widerrufen“ hebt die Registrierung dieses Schlüssels jetzt auch auf dem Server auf und löscht ihn zusätzlich vom Datenträger von OpenClaw.

Aktiviert den Dateiaustausch für den SimpleX-Kanal.

Die Aktion „SimpleX konfigurieren“ installiert jetzt openclaw-simplex 1.8.0 oder neuer und bindet die gemeinsamen Dateiverzeichnisse der Bridge in OpenClaw ein, sodass Agenten Dateien über SimpleX senden und empfangen können.

Nutzen Sie SimpleX bereits? Dieses Update wird nicht automatisch angewendet – öffnen Sie die Aktion „SimpleX konfigurieren“, stellen Sie sicher, dass sie aktiviert ist, und klicken Sie auf „Absenden“, um das Plugin zu aktualisieren und den Dateiaustausch anzuwenden.`,
    pl_PL: `Naprawia „Zaloguj się do StartOS”. Dołączony start-cli był wersją przedpremierową uwierzytelniającą się plikami cookie, które obsługiwane hosty StartOS odrzucają; teraz jest to start-cli 1.1.0 z uwierzytelnianiem kluczem podpisującym. „Odwołaj dostęp do StartOS” wyrejestrowuje teraz ten klucz również z serwera, a nie tylko usuwa go z woluminu danych OpenClaw.

Włącza wymianę plików dla kanału SimpleX.

Akcja „Konfiguruj SimpleX” instaluje teraz openclaw-simplex 1.8.0 lub nowszy i podłącza współdzielone katalogi plików mostu do OpenClaw, aby agenci mogli wysyłać i odbierać pliki przez SimpleX.

Już używasz SimpleX? Ta aktualizacja nie zastosuje się sama — otwórz akcję „Konfiguruj SimpleX”, upewnij się, że jest włączona, i kliknij „Wyślij”, aby zaktualizować wtyczkę i zastosować wymianę plików.`,
    fr_FR: `Corrige « Se connecter à StartOS ». Le start-cli intégré était une préversion qui s'authentifiait par cookies, ce que les hôtes StartOS pris en charge rejettent ; il s'agit désormais de start-cli 1.1.0 et de son authentification par clé de signature. « Révoquer l'accès à StartOS » annule désormais aussi l'enregistrement de cette clé sur le serveur, en plus de la supprimer du volume de données d'OpenClaw.

Active l'échange de fichiers pour le canal SimpleX.

L'action « Configurer SimpleX » installe désormais openclaw-simplex 1.8.0 ou une version ultérieure et relie les répertoires de fichiers partagés du pont à OpenClaw, afin que les agents puissent envoyer et recevoir des fichiers via SimpleX.

Vous utilisez déjà SimpleX ? Cette mise à jour ne s'applique pas d'elle-même : ouvrez l'action « Configurer SimpleX », assurez-vous qu'elle est activée, puis cliquez sur « Soumettre » pour mettre à jour le plugin et appliquer l'échange de fichiers.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
