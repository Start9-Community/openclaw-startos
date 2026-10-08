import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.9.4:1',
  releaseNotes: {
    en_US: `- Reset Password asks for confirmation before it replaces the current gateway password.
- Repair OpenClaw, Approve Browser Pairing and Connect WhatsApp show their output with its line breaks intact.
- The provider, DM Policy, SimpleX channel and Repair OpenClaw command fields describe each of their options.
- Configure AI Provider reads vLLM's API key, so vLLM can be selected as a provider.`,
    es_ES: `- Restablecer contraseña pide confirmación antes de reemplazar la contraseña actual del gateway.
- Reparar OpenClaw, Aprobar emparejamiento del navegador y Conectar WhatsApp muestran su salida con los saltos de línea intactos.
- Los campos de proveedor, Política de DM, canal de SimpleX y comando de Reparar OpenClaw describen cada una de sus opciones.
- Configurar proveedor de IA lee la clave de API de vLLM, por lo que vLLM puede elegirse como proveedor.`,
    de_DE: `- Passwort zurücksetzen fragt nach einer Bestätigung, bevor es das aktuelle Gateway-Passwort ersetzt.
- OpenClaw reparieren, Browser-Kopplung genehmigen und WhatsApp verbinden zeigen ihre Ausgabe mit erhaltenen Zeilenumbrüchen.
- Die Felder für Anbieter, DM-Richtlinie, SimpleX-Kanal und den Befehl von OpenClaw reparieren beschreiben jede ihrer Optionen.
- KI-Anbieter konfigurieren liest den API-Schlüssel von vLLM, sodass vLLM als Anbieter gewählt werden kann.`,
    pl_PL: `- Zresetuj hasło prosi o potwierdzenie, zanim zastąpi obecne hasło bramy.
- Napraw OpenClaw, Zatwierdź parowanie przeglądarki i Połącz WhatsApp pokazują swoje wyniki z zachowanymi podziałami wierszy.
- Pola dostawcy, Polityki DM, kanału SimpleX i polecenia Napraw OpenClaw opisują każdą ze swoich opcji.
- Konfiguruj dostawcę AI odczytuje klucz API vLLM, więc vLLM można wybrać jako dostawcę.`,
    fr_FR: `- Réinitialiser le mot de passe demande une confirmation avant de remplacer le mot de passe actuel du gateway.
- Réparer OpenClaw, Approuver l'appairage du navigateur et Connecter WhatsApp affichent leur sortie avec ses retours à la ligne intacts.
- Les champs du fournisseur, de la politique de DM, du canal SimpleX et de la commande de Réparer OpenClaw décrivent chacune de leurs options.
- Configurer le fournisseur d'IA lit la clé d'API de vLLM, ce qui permet de choisir vLLM comme fournisseur.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
