import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.7.1:2',
  releaseNotes: {
    en_US: `Adds an optional SimpleX channel.

Enable it in the new "Configure SimpleX" action to run OpenClaw over SimpleX through the SimpleX Websocket Bridge package (installed as an optional dependency). The action installs the openclaw-simplex plugin and points it at the bridge over the internal network.`,
    es_ES: `Añade un canal opcional de SimpleX.

Actívalo en la nueva acción «Configurar SimpleX» para ejecutar OpenClaw sobre SimpleX a través del paquete SimpleX Websocket Bridge (instalado como dependencia opcional). La acción instala el complemento openclaw-simplex y lo apunta al puente a través de la red interna.`,
    de_DE: `Fügt einen optionalen SimpleX-Kanal hinzu.

Aktivieren Sie ihn in der neuen Aktion „SimpleX konfigurieren“, um OpenClaw über SimpleX mithilfe des Pakets SimpleX Websocket Bridge (als optionale Abhängigkeit installiert) zu betreiben. Die Aktion installiert das openclaw-simplex-Plugin und richtet es über das interne Netzwerk auf die Bridge aus.`,
    pl_PL: `Dodaje opcjonalny kanał SimpleX.

Włącz go w nowej akcji „Konfiguruj SimpleX”, aby uruchomić OpenClaw przez SimpleX za pośrednictwem pakietu SimpleX Websocket Bridge (instalowanego jako opcjonalna zależność). Akcja instaluje wtyczkę openclaw-simplex i kieruje ją na mostek przez sieć wewnętrzną.`,
    fr_FR: `Ajoute un canal SimpleX facultatif.

Activez-le dans la nouvelle action « Configurer SimpleX » pour faire fonctionner OpenClaw via SimpleX grâce au paquet SimpleX Websocket Bridge (installé comme dépendance facultative). L'action installe le plugin openclaw-simplex et le dirige vers le pont via le réseau interne.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
