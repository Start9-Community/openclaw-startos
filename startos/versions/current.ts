import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.7.1:8',
  releaseNotes: {
    en_US: `Requests the StartOS root certificate against an address the OS still issues for, rather than the retired service-hostname form. That certificate is what lets the agent talk to your server, and it is installed on every start.`,
    es_ES: `Solicita el certificado raíz de StartOS para una dirección que el sistema aún emite, en lugar del formato de nombre de host de servicio retirado. Ese certificado es lo que permite al agente comunicarse con tu servidor y se instala en cada arranque.`,
    de_DE: `Fordert das StartOS-Stammzertifikat für eine Adresse an, für die das System weiterhin ausstellt, statt für die ausgemusterte Dienst-Hostnamen-Form. Dieses Zertifikat ermöglicht dem Agenten die Kommunikation mit Ihrem Server und wird bei jedem Start installiert.`,
    pl_PL: `Żąda certyfikatu głównego StartOS dla adresu, dla którego system nadal wystawia certyfikaty, zamiast wycofanej formy nazwy hosta usługi. To właśnie ten certyfikat umożliwia agentowi komunikację z serwerem i jest instalowany przy każdym uruchomieniu.`,
    fr_FR: `Demande le certificat racine de StartOS pour une adresse que le système délivre encore, plutôt que pour la forme de nom d'hôte de service retirée. Ce certificat est ce qui permet à l'agent de dialoguer avec votre serveur, et il est installé à chaque démarrage.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
