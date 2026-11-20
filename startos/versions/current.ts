import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.9.4:6',
  releaseNotes: {
    en_US: `The **Login to StartOS** task, which grants the agent root-equivalent control of your server, is now optional and offered once at install instead of on every start. Dismiss it and it stays dismissed; the action is still under Actions, alongside **Revoke StartOS Access**. The Web UI now accepts browsers only on this service's own addresses (LAN, \`.local\`, Tor and any domain you add) rather than whatever name a request claims.`,
    es_ES: `La tarea **Iniciar sesión en StartOS**, que otorga al agente un control equivalente a root sobre tu servidor, ahora es opcional y se ofrece una sola vez al instalar, en lugar de en cada inicio. Si la descartas, no vuelve; la acción sigue en Acciones, junto a **Revocar acceso a StartOS**. La interfaz web ahora solo acepta navegadores en las direcciones propias de este servicio (LAN, \`.local\`, Tor y cualquier dominio que añadas), en lugar de cualquier nombre que indique una solicitud.`,
    de_DE: `Die Aufgabe **Bei StartOS anmelden**, die dem Agenten Root-gleiche Kontrolle über Ihren Server gibt, ist jetzt optional und wird einmal bei der Installation angeboten statt bei jedem Start. Einmal verworfen, bleibt sie verworfen; die Aktion steht weiterhin unter Aktionen, neben **StartOS-Zugriff widerrufen**. Die Web-Oberfläche akzeptiert Browser jetzt nur noch unter den eigenen Adressen dieses Dienstes (LAN, \`.local\`, Tor und jede Domain, die Sie hinzufügen) statt unter jedem Namen, den eine Anfrage angibt.`,
    pl_PL: `Zadanie **Zaloguj się do StartOS**, które daje agentowi kontrolę nad serwerem równoważną uprawnieniom roota, jest teraz opcjonalne i proponowane raz przy instalacji zamiast przy każdym uruchomieniu. Po odrzuceniu nie wraca; akcja nadal jest dostępna w Akcjach, obok **Odwołaj dostęp do StartOS**. Interfejs WWW przyjmuje teraz przeglądarki tylko pod własnymi adresami tej usługi (LAN, \`.local\`, Tor i każda dodana domena), a nie pod dowolną nazwą podaną w żądaniu.`,
    fr_FR: `La tâche **Se connecter à StartOS**, qui donne à l'agent un contrôle équivalent à root sur votre serveur, est désormais facultative et proposée une seule fois à l'installation plutôt qu'à chaque démarrage. Une fois écartée, elle ne revient pas ; l'action reste dans Actions, à côté de **Révoquer l'accès à StartOS**. L'interface web n'accepte désormais les navigateurs que sur les adresses propres à ce service (LAN, \`.local\`, Tor et tout domaine que vous ajoutez), et non plus sous n'importe quel nom annoncé par une requête.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
