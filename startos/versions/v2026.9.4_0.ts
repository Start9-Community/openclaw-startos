import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { rename, rm } from 'fs/promises'
import {
  authProfilesJson,
  defaultAgentId,
} from '../fileModels/authProfiles.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { DOCTOR_TIMEOUT_MS, runOpenclawCli } from '../utils'

export const v_2026_9_4_0 = VersionInfo.of({
  version: '2026.9.4:0',
  releaseNotes: {
    en_US: `Updates OpenClaw from 2026.7.1 to 2026.9.4.

- Search past conversations, use interactive widgets and dashboards in chat, and see Mermaid diagrams rendered inline.
- Request credentials through masked prompts, approve recurring automations once, and manage plugins from one Plugins workspace.
- Faster chat on long histories, replies that survive a gateway restart, and safer updates with rollback and recovery.

**This update migrates OpenClaw's state database and session history and cannot be rolled back.** Back up the service before updating.

**The SimpleX channel plugin must be updated to 2.0.0.** If you use SimpleX, submit Configure SimpleX after the update — a task will remind you.

**Every browser now needs a one-time approval after logging in to the Web UI.** When it stops at "Approve this browser", run the new **Approve Browser Pairing** action. A new **Repair OpenClaw** action runs OpenClaw's own doctor against the stopped service. The container now runs Node 26. Heartbeat instructions live in the gateway configuration now; the workspace \`HEARTBEAT.md\` is gone.

[Full upstream release notes](https://github.com/openclaw/openclaw/releases)`,
    es_ES: `Actualiza OpenClaw de 2026.7.1 a 2026.9.4.

- Busca conversaciones anteriores, usa widgets y paneles interactivos en el chat y ve los diagramas Mermaid renderizados en línea.
- Solicita credenciales mediante avisos enmascarados, aprueba automatizaciones recurrentes una sola vez y gestiona los complementos desde un único espacio de Complementos.
- Chat más rápido con historiales largos, respuestas que sobreviven a un reinicio del gateway y actualizaciones más seguras con reversión y recuperación.

**Esta actualización migra la base de datos de estado y el historial de sesiones de OpenClaw y no se puede revertir.** Haz una copia de seguridad del servicio antes de actualizar.

**El complemento del canal SimpleX debe actualizarse a la versión 2.0.0.** Si usas SimpleX, envía Configurar SimpleX después de actualizar: una tarea te lo recordará.

**Cada navegador necesita ahora una aprobación única tras iniciar sesión en la interfaz web.** Cuando se detenga en «Approve this browser», ejecuta la nueva acción **Aprobar emparejamiento del navegador**. La nueva acción **Reparar OpenClaw** ejecuta el propio doctor de OpenClaw con el servicio detenido. El contenedor ahora ejecuta Node 26. Las instrucciones del heartbeat viven ahora en la configuración del gateway; el \`HEARTBEAT.md\` del espacio de trabajo desaparece.

[Notas de la versión completas](https://github.com/openclaw/openclaw/releases)`,
    de_DE: `Aktualisiert OpenClaw von 2026.7.1 auf 2026.9.4.

- Durchsuchen Sie frühere Unterhaltungen, nutzen Sie interaktive Widgets und Dashboards im Chat und sehen Sie Mermaid-Diagramme direkt gerendert.
- Fordern Sie Zugangsdaten über maskierte Eingaben an, genehmigen Sie wiederkehrende Automatisierungen einmalig und verwalten Sie Plugins in einem gemeinsamen Plugin-Bereich.
- Schnellerer Chat bei langen Verläufen, Antworten, die einen Gateway-Neustart überstehen, und sicherere Updates mit Rollback und Wiederherstellung.

**Dieses Update migriert die Zustandsdatenbank und den Sitzungsverlauf von OpenClaw und kann nicht rückgängig gemacht werden.** Sichern Sie den Dienst vor dem Update.

**Das SimpleX-Kanal-Plugin muss auf 2.0.0 aktualisiert werden.** Wenn Sie SimpleX nutzen, führen Sie nach dem Update „SimpleX konfigurieren“ aus – eine Aufgabe erinnert Sie daran.

**Jeder Browser braucht nach der Anmeldung an der Web-Oberfläche jetzt eine einmalige Genehmigung.** Bleibt er bei „Approve this browser“ stehen, führen Sie die neue Aktion **Browser-Kopplung genehmigen** aus. Die neue Aktion **OpenClaw reparieren** führt OpenClaws eigenen Doctor bei gestopptem Dienst aus. Der Container läuft jetzt mit Node 26. Die Heartbeat-Anweisungen liegen jetzt in der Gateway-Konfiguration; die \`HEARTBEAT.md\` im Arbeitsbereich entfällt.

[Vollständige Release-Notes](https://github.com/openclaw/openclaw/releases)`,
    pl_PL: `Aktualizuje OpenClaw z 2026.7.1 do 2026.9.4.

- Przeszukuj wcześniejsze rozmowy, korzystaj z interaktywnych widżetów i pulpitów w czacie oraz oglądaj diagramy Mermaid renderowane bezpośrednio.
- Proszenie o dane uwierzytelniające przez maskowane monity, jednorazowe zatwierdzanie cyklicznych automatyzacji i zarządzanie wtyczkami w jednym miejscu.
- Szybszy czat przy długich historiach, odpowiedzi przetrwają restart bramy, a aktualizacje są bezpieczniejsze dzięki wycofywaniu i odzyskiwaniu.

**Ta aktualizacja migruje bazę danych stanu i historię sesji OpenClaw i nie można jej cofnąć.** Przed aktualizacją wykonaj kopię zapasową usługi.

**Wtyczkę kanału SimpleX trzeba zaktualizować do wersji 2.0.0.** Jeśli używasz SimpleX, po aktualizacji uruchom Konfiguruj SimpleX – zadanie Ci o tym przypomni.

**Każda przeglądarka wymaga teraz jednorazowego zatwierdzenia po zalogowaniu do interfejsu WWW.** Gdy zatrzyma się na „Approve this browser”, uruchom nową akcję **Zatwierdź parowanie przeglądarki**. Nowa akcja **Napraw OpenClaw** uruchamia własnego doctora OpenClaw przy zatrzymanej usłudze. Kontener działa teraz na Node 26. Instrukcje heartbeatu znajdują się teraz w konfiguracji bramy; plik \`HEARTBEAT.md\` w obszarze roboczym znika.

[Pełne informacje o wydaniu](https://github.com/openclaw/openclaw/releases)`,
    fr_FR: `Met à jour OpenClaw de 2026.7.1 vers 2026.9.4.

- Recherchez dans vos conversations passées, utilisez des widgets et tableaux de bord interactifs dans le chat et affichez les diagrammes Mermaid directement rendus.
- Demandez des identifiants via des invites masquées, approuvez une seule fois les automatisations récurrentes et gérez les plugins depuis un espace Plugins unique.
- Chat plus rapide sur les longs historiques, réponses qui survivent à un redémarrage de la passerelle et mises à jour plus sûres avec retour arrière et récupération.

**Cette mise à jour migre la base de données d'état et l'historique des sessions d'OpenClaw et ne peut pas être annulée.** Sauvegardez le service avant de mettre à jour.

**Le plugin du canal SimpleX doit être mis à jour vers la 2.0.0.** Si vous utilisez SimpleX, lancez Configurer SimpleX après la mise à jour : une tâche vous le rappellera.

**Chaque navigateur a désormais besoin d'une approbation unique après connexion à l'interface web.** Lorsqu'il s'arrête sur « Approve this browser », lancez la nouvelle action **Approuver l'appairage du navigateur**. La nouvelle action **Réparer OpenClaw** exécute le doctor d'OpenClaw sur le service arrêté. Le conteneur fonctionne désormais avec Node 26. Les instructions du heartbeat résident désormais dans la configuration de la passerelle ; le \`HEARTBEAT.md\` de l'espace de travail disparaît.

[Notes de version complètes](https://github.com/openclaw/openclaw/releases)`,
  },
  migrations: {
    up: async ({ effects }) => {
      // Before doctor runs: it archives this file where it sat as a retired source.
      await rename(
        sdk.volumes.main.subpath(
          `.openclaw/agents/${defaultAgentId}/agent/auth-profiles.json`,
        ),
        authProfilesJson.path,
      ).catch((e) => {
        if (e.code !== 'ENOENT') throw e
      })
      // Doctor would import it into the heartbeat scratch, doubling the config prompt.
      await rm(sdk.volumes.main.subpath('.openclaw/workspace/HEARTBEAT.md'), {
        force: true,
      })

      for (const args of [
        ['doctor', '--fix', '--non-interactive'],
        ['doctor', '--session-sqlite', 'import', '--session-sqlite-all-agents'],
      ]) {
        const result = await runOpenclawCli(
          effects,
          'openclaw-doctor',
          args,
          DOCTOR_TIMEOUT_MS,
        )
        if (result.exitCode !== 0) {
          throw new Error(
            `${i18n('OpenClaw could not migrate its state')} (openclaw ${args.join(' ')}, exit ${result.exitCode ?? result.exitSignal}):\n${String(result.stderr)}\n${String(result.stdout)}`,
          )
        }
      }
    },
    down: IMPOSSIBLE,
  },
})
