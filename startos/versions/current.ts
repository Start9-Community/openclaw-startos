import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '2026.6.8:1',
  releaseNotes: {
    en_US: `**Provider selection**

- Configure AI Provider now supports four cloud providers (Anthropic, OpenAI, Google Gemini, xAI Grok), each with a current model dropdown plus a Custom Model field for any other id, and local backends — Ollama, vLLM, and llama.cpp running on your StartOS server, added as a dependency and wired automatically so inference can stay on-device.
- Refreshed the default models (e.g. Claude Opus 4.8, GPT-5.5). Change the model anytime from Web UI chat with /model.
- Removed the non-functional subscription-OAuth option; configure each cloud provider with its API key.

**Onboarding & docs**

- Login to StartOS is no longer a critical install task — it appears once the gateway is running, so OpenClaw works as a chat agent without granting server access.
- Corrected the README and setup instructions (log in to the Web UI with your Set Password value; accurate provider/model lists).`,
    es_ES: `**Selección de proveedor**

- Configurar proveedor de IA ahora admite cuatro proveedores en la nube (Anthropic, OpenAI, Google Gemini, xAI Grok), cada uno con un menú de modelos actuales y un campo de modelo personalizado, además de backends locales: Ollama, vLLM y llama.cpp que se ejecutan en tu servidor StartOS, añadidos como dependencia y configurados automáticamente para que la inferencia pueda permanecer en el dispositivo.
- Modelos predeterminados actualizados (p. ej. Claude Opus 4.8, GPT-5.5). Cambia el modelo en cualquier momento desde el chat de la interfaz web con /model.
- Se eliminó la opción de OAuth de suscripción que no funcionaba; configure cada proveedor en la nube con su clave de API.

**Configuración inicial y documentación**

- Iniciar sesión en StartOS ya no es una tarea crítica de instalación: aparece una vez que el gateway está en ejecución, por lo que OpenClaw funciona como agente de chat sin conceder acceso al servidor.
- Se corrigieron el README y las instrucciones de configuración (inicie sesión en la interfaz web con su valor de Establecer contraseña; listas de proveedores/modelos precisas).`,
    de_DE: `**Anbieterauswahl**

- „KI-Anbieter konfigurieren" unterstützt jetzt vier Cloud-Anbieter (Anthropic, OpenAI, Google Gemini, xAI Grok), jeweils mit einer Auswahlliste aktueller Modelle und einem Feld für ein benutzerdefiniertes Modell, sowie lokale Backends – Ollama, vLLM und llama.cpp, die auf Ihrem StartOS-Server laufen, als Abhängigkeit hinzugefügt und automatisch eingerichtet, sodass die Inferenz auf dem Gerät bleiben kann.
- Standardmodelle aktualisiert (z. B. Claude Opus 4.8, GPT-5.5). Ändern Sie das Modell jederzeit im Web-UI-Chat mit /model.
- Die nicht funktionierende Abo-OAuth-Option wurde entfernt; konfigurieren Sie jeden Cloud-Anbieter mit seinem API-Schlüssel.

**Einrichtung & Dokumentation**

- „Bei StartOS anmelden" ist keine kritische Installationsaufgabe mehr — sie erscheint, sobald das Gateway läuft, sodass OpenClaw als Chat-Agent nutzbar ist, ohne Serverzugriff zu gewähren.
- README und Einrichtungsanweisungen korrigiert (melden Sie sich in der Web-UI mit Ihrem „Passwort festlegen"-Wert an; korrekte Anbieter-/Modelllisten).`,
    pl_PL: `**Wybór dostawcy**

- „Konfiguruj dostawcę AI" obsługuje teraz czterech dostawców w chmurze (Anthropic, OpenAI, Google Gemini, xAI Grok), każdy z listą aktualnych modeli i polem własnego modelu, a także lokalne backendy — Ollama, vLLM i llama.cpp działające na Twoim serwerze StartOS, dodawane jako zależność i konfigurowane automatycznie, dzięki czemu wnioskowanie może pozostać na urządzeniu.
- Zaktualizowano modele domyślne (np. Claude Opus 4.8, GPT-5.5). Zmień model w dowolnej chwili z czatu interfejsu webowego za pomocą /model.
- Usunięto niedziałającą opcję OAuth subskrypcji; skonfiguruj każdego dostawcę w chmurze za pomocą jego klucza API.

**Wdrożenie i dokumentacja**

- Logowanie do StartOS nie jest już krytycznym zadaniem instalacyjnym — pojawia się po uruchomieniu bramy, więc OpenClaw działa jako agent czatu bez przyznawania dostępu do serwera.
- Poprawiono README i instrukcje konfiguracji (zaloguj się do interfejsu webowego wartością z „Ustaw hasło"; dokładne listy dostawców/modeli).`,
    fr_FR: `**Sélection du fournisseur**

- « Configurer le fournisseur d'IA » prend désormais en charge quatre fournisseurs cloud (Anthropic, OpenAI, Google Gemini, xAI Grok), chacun avec une liste de modèles actuels et un champ Modèle personnalisé, ainsi que des backends locaux — Ollama, vLLM et llama.cpp s'exécutant sur votre serveur StartOS, ajoutés comme dépendance et configurés automatiquement pour que l'inférence puisse rester sur l'appareil.
- Modèles par défaut actualisés (p. ex. Claude Opus 4.8, GPT-5.5). Changez de modèle à tout moment depuis le chat de l'interface web avec /model.
- Suppression de l'option OAuth par abonnement non fonctionnelle ; configurez chaque fournisseur cloud avec sa clé d'API.

**Mise en route et documentation**

- « Se connecter à StartOS » n'est plus une tâche d'installation critique — elle apparaît une fois la passerelle démarrée, donc OpenClaw fonctionne comme agent de chat sans accorder l'accès au serveur.
- README et instructions de configuration corrigés (connectez-vous à l'interface web avec votre valeur « Définir le mot de passe » ; listes de fournisseurs/modèles exactes).`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: async ({ effects }) => {},
  },
})
