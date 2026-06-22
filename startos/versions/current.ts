import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.6.8:2',
  releaseNotes: {
    en_US: `**Server access**

- New **Revoke StartOS Access** action removes OpenClaw's stored \`start-cli\` authentication, letting you cut off server-administration access without uninstalling the service. Run **Login to StartOS** again to grant it back.`,
    es_ES: `**Acceso al servidor**

- La nueva acción **Revocar acceso a StartOS** elimina la autenticación \`start-cli\` almacenada de OpenClaw, lo que le permite cortar el acceso de administración del servidor sin desinstalar el servicio. Ejecute **Iniciar sesión en StartOS** de nuevo para volver a concederlo.`,
    de_DE: `**Serverzugriff**

- Die neue Aktion **StartOS-Zugriff widerrufen** entfernt die gespeicherte \`start-cli\`-Authentifizierung von OpenClaw, sodass Sie den Server-Administrationszugriff ohne Deinstallation des Dienstes abschalten können. Führen Sie **Bei StartOS anmelden** erneut aus, um ihn wieder zu gewähren.`,
    pl_PL: `**Dostęp do serwera**

- Nowa akcja **Odwołaj dostęp do StartOS** usuwa zapisaną autoryzację \`start-cli\` OpenClaw, co pozwala odciąć dostęp do administracji serwerem bez odinstalowywania usługi. Uruchom ponownie **Zaloguj się do StartOS**, aby przyznać go ponownie.`,
    fr_FR: `**Accès au serveur**

- La nouvelle action **Révoquer l'accès à StartOS** supprime l'authentification \`start-cli\` stockée d'OpenClaw, ce qui vous permet de couper l'accès d'administration du serveur sans désinstaller le service. Exécutez de nouveau **Se connecter à StartOS** pour le réaccorder.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
