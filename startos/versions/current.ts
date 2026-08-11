import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.7.1:6',
  releaseNotes: {
    en_US: `The SimpleX channel now follows address changes automatically. Previously, reinstalling the bridge would leave the channel unable to connect until you re-submitted the 'Configure' action; OpenClaw now picks up the new address and restarts itself.`,
    es_ES: `El canal de SimpleX ahora sigue los cambios de dirección automáticamente. Antes, reinstalar el puente dejaba el canal sin poder conectarse hasta que volvías a enviar la acción «Configurar»; ahora OpenClaw detecta la nueva dirección y se reinicia solo.`,
    de_DE: `Der SimpleX-Kanal folgt Adressänderungen jetzt automatisch. Bisher konnte sich der Kanal nach dem Neuinstallieren der Bridge nicht mehr verbinden, bis die Aktion „Konfigurieren“ erneut abgesendet wurde; OpenClaw übernimmt die neue Adresse nun und startet sich selbst neu.`,
    pl_PL: `Kanał SimpleX automatycznie podąża teraz za zmianami adresu. Wcześniej po ponownej instalacji mostu kanał nie mógł się połączyć, dopóki nie wysłałeś ponownie akcji „Konfiguruj”; teraz OpenClaw pobiera nowy adres i sam się restartuje.`,
    fr_FR: `Le canal SimpleX suit désormais automatiquement les changements d'adresse. Auparavant, réinstaller le pont empêchait le canal de se connecter tant que l'action « Configurer » n'était pas resoumise ; OpenClaw récupère maintenant la nouvelle adresse et redémarre de lui-même.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
