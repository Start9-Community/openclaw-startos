---
name: start-cli
description: StartOS CLI for managing servers, packages, backups, networking, and s9pk development
metadata:
  { 'openclaw': { 'requires': { 'bins': ['start-cli'] }, 'emoji': '🖥️' } }
user-invocable: false
---

# start-cli - StartOS Command Line Interface

`start-cli` is the official CLI for managing StartOS servers. It provides comprehensive control over packages, backups, networking, system administration, and s9pk package development.

All commands use **positional arguments** for primary identifiers (package IDs, SSIDs, etc.) and **flags** for optional modifiers. This is a consistent pattern throughout the CLI.

## CRITICAL: Only Use Documented Commands

**Only use commands exactly as documented in this file.** Do not guess or invent subcommands. If a command is not listed here, it does not exist. Common mistakes to avoid:

- **`start-cli registry list`** — DOES NOT EXIST. Use `start-cli -r <URL> registry package get` (no ID = list all).
- **`start-cli registry package list`** — DOES NOT EXIST. Use `start-cli -r <URL> registry package get` (no ID = list all).
- **`start-cli server check-update`** — DOES NOT EXIST. Use `start-cli server update <REGISTRY_URL>`.
- **`start-cli package list-updates`** — DOES NOT EXIST. Use `start-cli server update <REGISTRY_URL>` for OS updates, or `start-cli -r <URL> registry package get <ID>` to check a specific package's latest version.
- **`start-cli package health <ID>`** — DOES NOT EXIST. Use `start-cli package list` to see package statuses.
- **`start-cli db dump /public/...`** — WRONG. `db dump` takes no path arguments. Dump to a file first, then filter: `start-cli db dump > /tmp/db_dump.json && jq '...' /tmp/db_dump.json`.
- **`start-cli db dump | jq '...'`** — WRONG. Output is too large (~1-2MB) to pipe directly. Always dump to a file first, then run `jq` on the file.
- **`start-cli net tor *`** — DOES NOT EXIST. Tor was removed from StartOS and is now a separate package (`tor-startos`).
- **`start-cli init status`** — DOES NOT EXIST on CLI.
- **`start-cli setup status`** — DOES NOT EXIST on CLI.
- **`start-cli setup disk list`** — DOES NOT EXIST on CLI.

If a command fails, **do not retry with a guessed variation**. Instead, consult this documentation or run `start-cli <subcommand> --help`.

## Global Options

All commands accept these global options:

| Option                           | Description                                   |
| -------------------------------- | --------------------------------------------- |
| `-c, --config <CONFIG>`          | Path to config file                           |
| `-H, --host <HOST>`              | Server host address                           |
| `-r, --registry <REGISTRY>`      | Registry URL (required for registry commands) |
| `--registry-hostname <HOSTNAME>` | Registry hostname                             |
| `-t, --tunnel <TUNNEL>`          | Tunnel configuration                          |
| `-p, --proxy <PROXY>`            | Proxy configuration                           |
| `--cookie-path <PATH>`           | Path to auth cookie                           |
| `--developer-key-path <PATH>`    | Path to developer key                         |

---

## auth - Authentication Commands

Manage authentication sessions.

| Command                                    | Description                                    |
| ------------------------------------------ | ---------------------------------------------- |
| `start-cli auth login`                     | Log in a new auth session                      |
| `start-cli auth logout`                    | Log out of current auth session                |
| `start-cli auth reset-password`            | Reset password                                 |
| `start-cli auth get-pubkey`                | Get public key derived from server private key |
| `start-cli auth session list`              | List active auth sessions                      |
| `start-cli auth session kill <SESSION_ID>` | Kill a specific auth session                   |

### Examples

```bash
# Log in to a remote StartOS server
start-cli -H https://myserver.local auth login

# List active sessions
start-cli auth session list

# Kill a session
start-cli auth session kill <session-id>
```

---

## backup - Backup Management

Create backups and manage backup targets.

| Command                                          | Description                                     |
| ------------------------------------------------ | ----------------------------------------------- |
| `start-cli backup create <TARGET_ID> <PASSWORD>` | Create backup of packages to a target           |
| `start-cli backup target list`                   | List existing backup targets                    |
| `start-cli backup target info <TARGET_ID>`       | Display package backup information for a target |
| `start-cli backup target mount <TARGET_ID>`      | Mount a backup target                           |
| `start-cli backup target umount <TARGET_ID>`     | Unmount a backup target                         |
| `start-cli backup target cifs add`               | Add a CIFS (network share) backup target        |
| `start-cli backup target cifs remove`            | Remove a CIFS backup target                     |
| `start-cli backup target cifs update`            | Update a CIFS backup target                     |

### Backup Create Options

| Option                      | Description                                 |
| --------------------------- | ------------------------------------------- |
| `--old-password <PASSWORD>` | Previous backup password (if changing)      |
| `--package-ids <IDS>`       | Specific packages to back up (default: all) |

### Examples

```bash
# List backup targets
start-cli backup target list

# Create a backup of all packages to a target
start-cli backup create <target-id> "mybackuppassword"

# Back up specific packages only
start-cli backup create <target-id> "mybackuppassword" --package-ids bitcoin,lnd
```

---

## db - Database Commands

Interact with the StartOS **local** database. The database contains the state of the server and its **installed** packages. It does **NOT** contain registry data — to browse or search for packages available in a registry, use `registry` commands instead.

| Command                                           | Description                            |
| ------------------------------------------------- | -------------------------------------- |
| `start-cli db dump`                               | Dump the public database as JSON       |
| `start-cli db put ui <POINTER> <VALUE>`           | Add/update a UI record in the database |
| `start-cli db apply --path <PATH> --value <JSON>` | Update a database record               |

### Options for `db dump`

| Option                  | Description                                |
| ----------------------- | ------------------------------------------ |
| `-p, --include-private` | Include private/sensitive data in the dump |

**WARNING: `db dump` does NOT accept path arguments.** Do not pass paths like `/public/serverInfo` or `/public/packageData` — any positional argument is interpreted as a filesystem path to a database file, NOT a query filter, and will fail with "No such file or directory".

**WARNING: `db dump` produces very large output (~1-2MB).** Do NOT pipe it directly through `jq` — the large intermediate output will cause tool execution failures. Always dump to a file first, then filter with `jq` as a separate command.

### Important Structure of the Dump

The JSON output from `db dump` has the structure `{ "id": <number>, "value": { ... } }`. All data is nested under `.value`. The top-level keys under `.value` are:

| jq path                | Description                                             |
| ---------------------- | ------------------------------------------------------- |
| `.value.serverInfo`    | Server identity, version, networking, hostname          |
| `.value.packageData`   | All installed package metadata, configs, and state      |
| `.value.ui`            | UI settings: server display name, configured registries |
| `.value.ui.registries` | Object mapping registry URLs to display names           |

### Examples

```bash
# CORRECT — dump to file first, then filter with jq:
start-cli db dump > /tmp/db_dump.json
jq '.value.serverInfo' /tmp/db_dump.json
jq '.value.packageData' /tmp/db_dump.json
jq '.value.packageData.bitcoin' /tmp/db_dump.json
jq '.value.ui.registries' /tmp/db_dump.json

# Include private data (keys, passwords - use with caution)
start-cli db dump -p > /tmp/db_dump_private.json

# WRONG — piping directly will fail on large output:
# start-cli db dump | jq '.value.ui.registries'

# WRONG — path arguments will fail:
# start-cli db dump /public/serverInfo
# start-cli db dump /public/packageData
```

---

## diagnostic - Diagnostics and Troubleshooting

Available when the server is in diagnostic mode (e.g., after a failed boot).

| Command                            | Description                             |
| ---------------------------------- | --------------------------------------- |
| `start-cli diagnostic error`       | Display the diagnostic error            |
| `start-cli diagnostic logs`        | Display OS logs                         |
| `start-cli diagnostic kernel-logs` | Display kernel logs                     |
| `start-cli diagnostic restart`     | Restart the server                      |
| `start-cli diagnostic rebuild`     | Teardown and rebuild service containers |
| `start-cli diagnostic disk repair` | Repair disk corruption                  |
| `start-cli diagnostic disk forget` | Remove disk from filesystem             |

---

## kiosk - Kiosk Mode

Enable or disable kiosk mode for the local display.

| Command                   | Description        |
| ------------------------- | ------------------ |
| `start-cli kiosk enable`  | Enable kiosk mode  |
| `start-cli kiosk disable` | Disable kiosk mode |

---

## disk - Disk Management

List disk information and repair.

| Command                 | Description                                                       |
| ----------------------- | ----------------------------------------------------------------- |
| `start-cli disk list`   | List disks with capacity, used space, labels, and StartOS version |
| `start-cli disk repair` | Repair disk in the event of corruption                            |

### Examples

```bash
# List all disks and their usage
start-cli disk list
```

---

## init - Initialization

Commands available during server initialization.

| Command                      | Description                          |
| ---------------------------- | ------------------------------------ |
| `start-cli init logs`        | Display initialization logs          |
| `start-cli init kernel-logs` | Display kernel logs during init      |
| `start-cli init subscribe`   | Subscribe to initialization progress |

Note: `start-cli init status` does NOT exist on the CLI.

---

## net - Network Management

Manage networking including Tor, DNS, gateways, tunnels, and certificates.

### ACME (SSL Certificate) Commands

| Command                                                           | Description                             |
| ----------------------------------------------------------------- | --------------------------------------- |
| `start-cli net acme init --provider <PROVIDER> --contact <EMAIL>` | Setup automatic certificate acquisition |
| `start-cli net acme remove --provider <PROVIDER>`                 | Remove ACME certificate configuration   |

### DNS Commands

| Command                        | Description                         |
| ------------------------------ | ----------------------------------- |
| `start-cli net dns query`      | Test DNS configuration for a domain |
| `start-cli net dns set-static` | Set static DNS servers              |
| `start-cli net dns dump-table` | Dump the DNS table                  |

### Port Forwarding Commands

| Command                            | Description                           |
| ---------------------------------- | ------------------------------------- |
| `start-cli net forward dump-table` | Display current port forwarding rules |

### Gateway Commands

| Command                                                | Description                                |
| ------------------------------------------------------ | ------------------------------------------ |
| `start-cli net gateway list`                           | Show gateways StartOS can listen on        |
| `start-cli net gateway set-name <GATEWAY> <NAME>`      | Rename a gateway                           |
| `start-cli net gateway set-default-outbound <GATEWAY>` | Set default outbound gateway               |
| `start-cli net gateway check-dns <GATEWAY>`            | Check DNS resolution through a gateway     |
| `start-cli net gateway check-port <GATEWAY>`           | Check port accessibility through a gateway |
| `start-cli net gateway forget <GATEWAY>`               | Forget a disconnected gateway              |

### Virtual Host Commands

| Command                          | Description                           |
| -------------------------------- | ------------------------------------- |
| `start-cli net vhost dump-table` | Dump the SSL virtual host proxy table |

### Tunnel Commands

| Command                       | Description             |
| ----------------------------- | ----------------------- |
| `start-cli net tunnel add`    | Add a network tunnel    |
| `start-cli net tunnel remove` | Remove a network tunnel |

### Examples

```bash
# List all gateways
start-cli net gateway list

# Dump port forwarding rules
start-cli net forward dump-table

# Dump the DNS table
start-cli net dns dump-table

# Dump virtual host proxy table
start-cli net vhost dump-table

# Setup ACME for Let's Encrypt certificates
start-cli net acme init --provider letsencrypt --contact admin@example.com
```

---

## notification - Notification Management

Create, list, and manage system notifications.

| Command                                        | Description                                              |
| ---------------------------------------------- | -------------------------------------------------------- |
| `start-cli notification list [BEFORE] [LIMIT]` | List notifications (optionally before an ID, with limit) |
| `start-cli notification create`                | Create a new notification                                |
| `start-cli notification remove <ID>...`        | Remove notifications by ID(s)                            |
| `start-cli notification remove-before <ID>`    | Remove all notifications before a given ID               |
| `start-cli notification mark-seen <ID>...`     | Mark notification(s) as seen                             |
| `start-cli notification mark-seen-before <ID>` | Mark all notifications before a given ID as seen         |
| `start-cli notification mark-unseen <ID>...`   | Mark notification(s) as unseen                           |

### Examples

```bash
# List the 20 most recent notifications
start-cli notification list

# List 50 notifications
start-cli notification list "" 50

# Mark notifications as seen
start-cli notification mark-seen 42 43 44
```

---

## package - Package Management

Install, configure, and manage packages (services).

Note: There is no `start-cli package list-updates`, `start-cli package health`, or `start-cli package status` command. Use `start-cli package list` to see all installed packages and their current status.

### Core Commands

| Command                                       | Description                                    |
| --------------------------------------------- | ---------------------------------------------- |
| `start-cli package list`                      | List all installed packages                    |
| `start-cli package install <ID> [VERSION]`    | Install a package from the configured registry |
| `start-cli package install --sideload <PATH>` | Install from a local .s9pk file                |
| `start-cli package uninstall <ID>`            | Remove a package                               |
| `start-cli package cancel-install <ID>`       | Cancel an in-progress installation             |
| `start-cli package installed-version <ID>`    | Display installed version of a package         |

### Uninstall Options

| Option    | Description                              |
| --------- | ---------------------------------------- |
| `--soft`  | Soft uninstall (preserve data)           |
| `--force` | Force uninstall even if dependents exist |

### Service Control

| Command                                       | Description                            |
| --------------------------------------------- | -------------------------------------- |
| `start-cli package start <ID>`                | Start a service                        |
| `start-cli package stop <ID>`                 | Stop a service                         |
| `start-cli package restart <ID>`              | Restart a service                      |
| `start-cli package rebuild <ID>`              | Rebuild the service container          |
| `start-cli package set-outbound-gateway <ID>` | Set the outbound gateway for a package |

### Monitoring

| Command                                      | Description                                               |
| -------------------------------------------- | --------------------------------------------------------- |
| `start-cli package logs <ID> [-f] [-l N]`    | Display package logs                                      |
| `start-cli package stats`                    | List container stats for all packages (CPU, memory, disk) |
| `start-cli package attach <ID> [COMMAND...]` | Execute a command inside a running container              |

### Logs Options

| Option                  | Description                      |
| ----------------------- | -------------------------------- |
| `-f, --follow`          | Stream logs in real time         |
| `-l, --limit <N>`       | Limit number of log lines        |
| `-c, --cursor <CURSOR>` | Start from a specific log cursor |
| `-b, --boot <BOOT>`     | Filter by boot identifier        |
| `-B, --before`          | Show logs before the cursor      |

### Attach Options

| Option                      | Description                         |
| --------------------------- | ----------------------------------- |
| `--force-tty`               | Force TTY allocation                |
| `-s, --subcontainer <NAME>` | Target a specific subcontainer      |
| `-n, --name <NAME>`         | Target a specific container by name |
| `-u, --user <USER>`         | Run as a specific user              |
| `-i, --image-id <IMAGE>`    | Target a specific image             |

### Actions

| Command                                                        | Description                               |
| -------------------------------------------------------------- | ----------------------------------------- |
| `start-cli package action get-input <PKG_ID> <ACTION_ID>`      | Get the input specification for an action |
| `start-cli package action run <PKG_ID> [EVENT_ID] <ACTION_ID>` | Run a service action (input via stdin)    |
| `start-cli package action clear-task <PKG_ID> <ACTION_ID>`     | Clear a service task                      |

### Backup and Restore

| Command                                                                | Description                             |
| ---------------------------------------------------------------------- | --------------------------------------- |
| `start-cli package backup restore <PKG_IDS>... <TARGET_ID> <PASSWORD>` | Restore package(s) from a backup target |

### Host Management

| Command                                | Description                            |
| -------------------------------------- | -------------------------------------- |
| `start-cli package host list <ID>`     | List network host IDs for a package    |
| `start-cli package host address`       | Manage network addresses for a package |
| `start-cli package host binding list`  | List network bindings for a package    |
| `start-cli package host binding set`   | Set a network binding for a package    |
| `start-cli package host binding clear` | Clear a network binding for a package  |

### Examples

```bash
# List all installed packages
start-cli package list

# Install a package from registry
start-cli package install bitcoin

# Install a specific version
start-cli package install bitcoin ">=0.1.0"

# Sideload a local package
start-cli package install --sideload ./mypackage.s9pk

# Start a service
start-cli package start bitcoin

# View package logs (last 100 lines)
start-cli package logs bitcoin --limit 100

# Follow package logs in real time
start-cli package logs bitcoin --follow

# View container resource usage for all packages
start-cli package stats

# Run a package action
start-cli package action run bitcoin create-backup

# Get input spec for an action (to know what parameters it expects)
start-cli package action get-input bitcoin configure

# Execute a command inside a package container
start-cli package attach bitcoin ls /data

# Uninstall, keeping data
start-cli package uninstall bitcoin --soft
```

---

## registry - Registry Management

Query and manage package registries.

**IMPORTANT:** All registry commands require the `-r` / `--registry` global flag **before** `registry` to specify which registry to query. There is no `start-cli registry list`, `start-cli registry package list`, or any `registry` command without `-r <URL>`. Users may have multiple registries configured.

### Discovering Configured Registries

To find which registries the user has configured, query the **local** database (dump to file first — output is too large to pipe):

```bash
start-cli db dump > /tmp/db_dump.json
jq '.value.ui.registries' /tmp/db_dump.json
```

This returns an object mapping registry URLs to display names, e.g.:

```json
{
  "https://registry.start9.com/": "Start9 Registry",
  "https://community-registry.start9.com/": "Community Registry"
}
```

**Common mistake:** Registries are under `.value.ui.registries`, NOT `.value.serverInfo.registries`.

Then use each registry URL with the `--registry` flag to query **registry** commands (e.g., `registry package index`, `registry package get`). The local database does NOT contain registry package listings — you must use the `registry` commands below to browse or search for available packages.

### Commands

| Command                                     | Description                                 |
| ------------------------------------------- | ------------------------------------------- |
| `start-cli -r <URL> registry index`         | List full registry index (name, categories) |
| `start-cli -r <URL> registry info`          | Display registry name, icon, and categories |
| `start-cli -r <URL> registry info set-name` | Update registry name                        |
| `start-cli -r <URL> registry info set-icon` | Set registry icon                           |

### Package Commands

| Command                                                       | Description                                                              |
| ------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `start-cli -r <URL> registry package get [ID]`                | List all available packages, or get details for a specific package by ID |
| `start-cli -r <URL> registry package index`                   | List all packages in the registry                                        |
| `start-cli -r <URL> registry package add --s9pk <FILE>`       | Add/publish a package to the registry                                    |
| `start-cli -r <URL> registry package remove <ID>`             | Remove a package from the registry                                       |
| `start-cli -r <URL> registry package download <ID>`           | Download an s9pk file                                                    |
| `start-cli -r <URL> registry package category list`           | List package categories                                                  |
| `start-cli -r <URL> registry package category add`            | Add a category                                                           |
| `start-cli -r <URL> registry package category add-package`    | Add a package to a category                                              |
| `start-cli -r <URL> registry package category remove-package` | Remove a package from a category                                         |
| `start-cli -r <URL> registry package signer add`              | Add a package signer                                                     |
| `start-cli -r <URL> registry package signer remove`           | Remove a package signer                                                  |
| `start-cli -r <URL> registry package signer list`             | List package signers                                                     |
| `start-cli -r <URL> registry package add-mirror`              | Add a mirror for an s9pk                                                 |
| `start-cli -r <URL> registry package remove-mirror`           | Remove a mirror from a package                                           |

### OS Version Commands

| Command                                                | Description                 |
| ------------------------------------------------------ | --------------------------- |
| `start-cli -r <URL> registry os index`                 | List OS version index       |
| `start-cli -r <URL> registry os version get`           | Get available OS versions   |
| `start-cli -r <URL> registry os version add`           | Add an OS version           |
| `start-cli -r <URL> registry os version remove`        | Remove an OS version        |
| `start-cli -r <URL> registry os version signer add`    | Add an OS version signer    |
| `start-cli -r <URL> registry os version signer remove` | Remove an OS version signer |
| `start-cli -r <URL> registry os version signer list`   | List OS version signers     |
| `start-cli -r <URL> registry os asset add`             | Add an OS asset             |
| `start-cli -r <URL> registry os asset remove`          | Remove an OS asset          |
| `start-cli -r <URL> registry os asset get`             | Get an OS asset             |
| `start-cli -r <URL> registry os asset sign`            | Sign an OS asset            |

### Admin Commands

| Command                                         | Description          |
| ----------------------------------------------- | -------------------- |
| `start-cli -r <URL> registry admin list`        | List registry admins |
| `start-cli -r <URL> registry admin add`         | Add an admin         |
| `start-cli -r <URL> registry admin remove`      | Remove an admin      |
| `start-cli -r <URL> registry admin signer list` | List admin signers   |
| `start-cli -r <URL> registry admin signer add`  | Add an admin signer  |
| `start-cli -r <URL> registry admin signer edit` | Edit an admin signer |

### Registry Database Commands

| Command                                | Description                            |
| -------------------------------------- | -------------------------------------- |
| `start-cli -r <URL> registry db dump`  | Dump the registry database             |
| `start-cli -r <URL> registry db apply` | Apply changes to the registry database |

### Examples

```bash
# List all available packages from a registry (no ID = list all)
start-cli -r https://registry.start9.com registry package get

# Get details/installation candidates for a specific package
start-cli -r https://registry.start9.com registry package get bitcoin

# Download a package s9pk
start-cli -r https://registry.start9.com registry package download bitcoin

# List categories
start-cli -r https://registry.start9.com registry package category list

# View registry info
start-cli -r https://registry.start9.com registry info
```

---

## s9pk - Package Development

Create, inspect, and convert s9pk package files.

### Commands

| Command                                   | Description                            |
| ----------------------------------------- | -------------------------------------- |
| `start-cli s9pk pack [PATH]`              | Package input files into a valid s9pk  |
| `start-cli s9pk convert <S9PK>`           | Convert s9pk from v1 to v2 format      |
| `start-cli s9pk edit <S9PK> add-image`    | Add an image to an s9pk                |
| `start-cli s9pk edit <S9PK> manifest`     | Edit an s9pk manifest                  |
| `start-cli s9pk inspect <S9PK> manifest`  | Display the s9pk manifest              |
| `start-cli s9pk inspect <S9PK> file-tree` | Display list of file paths in the s9pk |
| `start-cli s9pk inspect <S9PK> cat`       | Display file contents from the s9pk    |
| `start-cli s9pk list-ingredients`         | List paths of package ingredients      |

### Pack Options

| Option                      | Description              |
| --------------------------- | ------------------------ |
| `-o, --output <OUTPUT>`     | Output path              |
| `--javascript <JAVASCRIPT>` | Path to JavaScript file  |
| `--icon <ICON>`             | Path to icon file        |
| `--license <LICENSE>`       | Path to license file     |
| `--assets <ASSETS>`         | Path to assets directory |
| `--no-assets`               | Exclude assets           |
| `--arch <ARCH>`             | Architecture mask        |

### Examples

```bash
# Pack a project into s9pk
start-cli s9pk pack ./my-project -o my-package.s9pk

# Inspect a package manifest
start-cli s9pk inspect my-package.s9pk manifest

# List files in a package
start-cli s9pk inspect my-package.s9pk file-tree

# Convert v1 to v2
start-cli s9pk convert old-package.s9pk
```

---

## server - Server Administration

Manage the StartOS server itself.

Note: There is no `start-cli server check-update` command. To check for updates, use `start-cli server update <REGISTRY_URL>`.

### Monitoring

| Command                        | Description                                          |
| ------------------------------ | ---------------------------------------------------- |
| `start-cli server metrics`     | Display server metrics (CPU, RAM, disk, temperature) |
| `start-cli server time`        | Display current time and server uptime               |
| `start-cli server logs`        | Display OS system logs                               |
| `start-cli server kernel-logs` | Display kernel logs                                  |

### Power and Lifecycle

| Command                                  | Description                                 |
| ---------------------------------------- | ------------------------------------------- |
| `start-cli server restart`               | Restart the server                          |
| `start-cli server shutdown`              | Shutdown the server                         |
| `start-cli server rebuild`               | Teardown and rebuild all service containers |
| `start-cli server update <REGISTRY_URL>` | Check for and apply StartOS updates         |
| `start-cli server update-firmware`       | Update mainboard firmware                   |
| `start-cli server set-ifconfig-url`      | Set the URL used for external IP detection  |

### Update Options

| Option           | Description               |
| ---------------- | ------------------------- |
| `--to <VERSION>` | Target a specific version |
| `--no-progress`  | Disable progress output   |

### Host Management

| Command                         | Description                        |
| ------------------------------- | ---------------------------------- |
| `start-cli server host address` | Manage addresses for the system UI |
| `start-cli server host binding` | Manage bindings for the system UI  |

### SMTP Configuration

| Command                                                                                 | Description               |
| --------------------------------------------------------------------------------------- | ------------------------- |
| `start-cli server set-smtp --server <HOST> --port <PORT> --from <EMAIL> --login <USER>` | Configure SMTP            |
| `start-cli server clear-smtp`                                                           | Remove SMTP configuration |
| `start-cli server test-smtp`                                                            | Send a test email         |

### Localization

| Command                                         | Description         |
| ----------------------------------------------- | ------------------- |
| `start-cli server set-language <LANGUAGE_CODE>` | Set system language |
| `start-cli server set-keyboard <LAYOUT>`        | Set keyboard layout |

### Keyboard Options

| Option                    | Description                       |
| ------------------------- | --------------------------------- |
| `-k, --keymap <KEYMAP>`   | Keyboard keymap                   |
| `-m, --model <MODEL>`     | Keyboard model                    |
| `-v, --variant <VARIANT>` | Keyboard variant                  |
| `--option <OPTION>`       | Keyboard option (can be repeated) |

### Experimental Features

| Command                                              | Description                        |
| ---------------------------------------------------- | ---------------------------------- |
| `start-cli server experimental governor [GOVERNOR]`  | Show or set CPU governor           |
| `start-cli server experimental zram --enable <BOOL>` | Enable or disable ZRAM compression |

### Examples

```bash
# Check server health
start-cli server metrics

# Check uptime
start-cli server time

# View recent OS logs
start-cli server logs

# Update StartOS from a registry
start-cli server update https://registry.start9.com

# Update to a specific version
start-cli server update https://registry.start9.com --to 0.4.0

# Configure SMTP for email notifications
start-cli server set-smtp --server smtp.example.com --port 587 --from admin@example.com --login admin

# Send a test email
start-cli server test-smtp

# Restart the server
start-cli server restart
```

---

## setup - Setup Commands

Commands available during initial server setup.

| Command                       | Description                      |
| ----------------------------- | -------------------------------- |
| `start-cli setup logs`        | Display setup logs               |
| `start-cli setup cifs add`    | Add a CIFS share during setup    |
| `start-cli setup cifs update` | Update a CIFS share during setup |
| `start-cli setup cifs remove` | Remove a CIFS share during setup |

Note: `start-cli setup status` and `start-cli setup disk list` do NOT exist on the CLI.

---

## ssh - SSH Key Management

Manage SSH keys for server access. All parameters are positional.

| Command                              | Description                      |
| ------------------------------------ | -------------------------------- |
| `start-cli ssh list`                 | List all registered SSH keys     |
| `start-cli ssh add <PUBLIC_KEY>`     | Add an SSH public key            |
| `start-cli ssh remove <FINGERPRINT>` | Remove an SSH key by fingerprint |

### Examples

```bash
# List SSH keys
start-cli ssh list

# Add an SSH key
start-cli ssh add "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIG... user@host"

# Remove an SSH key by fingerprint
start-cli ssh remove "SHA256:abc123..."
```

---

## tunnel - StartTunnel Management

Manage StartTunnel for remote access via VPN-like tunnels. Tunnel commands require the `-t` / `--tunnel` global flag.

### Auth Commands

| Command                                | Description                |
| -------------------------------------- | -------------------------- |
| `start-cli tunnel auth login`          | Log in to the tunnel       |
| `start-cli tunnel auth logout`         | Log out of the tunnel      |
| `start-cli tunnel auth session list`   | List tunnel auth sessions  |
| `start-cli tunnel auth session kill`   | Kill a tunnel auth session |
| `start-cli tunnel auth set-password`   | Set tunnel password        |
| `start-cli tunnel auth reset-password` | Reset tunnel password      |
| `start-cli tunnel auth key add`        | Add an auth key            |
| `start-cli tunnel auth key remove`     | Remove an auth key         |
| `start-cli tunnel auth key list`       | List auth keys             |

### Device Commands

| Command                          | Description            |
| -------------------------------- | ---------------------- |
| `start-cli tunnel device add`    | Add device to a subnet |
| `start-cli tunnel device remove` | Remove a device        |
| `start-cli tunnel device list`   | List devices           |

### Subnet Commands

| Command                                   | Description      |
| ----------------------------------------- | ---------------- |
| `start-cli tunnel subnet <SUBNET> add`    | Add a new subnet |
| `start-cli tunnel subnet <SUBNET> remove` | Remove a subnet  |

### Port Forwarding

| Command                                | Description                 |
| -------------------------------------- | --------------------------- |
| `start-cli tunnel port-forward add`    | Add port forwarding rule    |
| `start-cli tunnel port-forward remove` | Remove port forwarding rule |

### Database Commands

| Command                     | Description                      |
| --------------------------- | -------------------------------- |
| `start-cli tunnel db dump`  | Dump tunnel database             |
| `start-cli tunnel db apply` | Apply changes to tunnel database |

### Web Commands

| Command                           | Description                     |
| --------------------------------- | ------------------------------- |
| `start-cli tunnel web init`       | Initialize tunnel web interface |
| `start-cli tunnel web set-listen` | Set tunnel web listen address   |
| `start-cli tunnel web get-listen` | Get tunnel web listen address   |

---

## util - Utilities

Miscellaneous utility commands.

| Command                       | Description                      |
| ----------------------------- | -------------------------------- |
| `start-cli util b3sum <FILE>` | Calculate BLAKE3 hash for a file |

### Examples

```bash
# Calculate blake3 hash
start-cli util b3sum myfile.tar.gz
```

---

## wifi - WiFi Management

Manage WiFi networks. SSIDs and passwords are positional arguments.

| Command                                     | Description                          |
| ------------------------------------------- | ------------------------------------ |
| `start-cli wifi get`                        | Display current WiFi connection info |
| `start-cli wifi available get`              | List available WiFi networks         |
| `start-cli wifi add <SSID> <PASSWORD>`      | Add a WiFi network                   |
| `start-cli wifi connect <SSID>`             | Connect to a saved WiFi network      |
| `start-cli wifi remove <SSID>`              | Remove a saved WiFi network          |
| `start-cli wifi set-enabled <true\|false>`  | Enable or disable WiFi               |
| `start-cli wifi country set <COUNTRY_CODE>` | Set WiFi country code                |

### Examples

```bash
# Check current WiFi status
start-cli wifi get

# List available networks
start-cli wifi available get

# Add and connect to a network
start-cli wifi add "MyNetwork" "mypassword"
start-cli wifi connect "MyNetwork"

# Disable WiFi
start-cli wifi set-enabled false

# Set country code
start-cli wifi country set US
```

---

## Other Commands

| Command                    | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| `start-cli echo <MESSAGE>` | Echo a message (for testing)                           |
| `start-cli git-info`       | Display the git hash / version of StartOS              |
| `start-cli state`          | Display the API state (Error / Initializing / Running) |
| `start-cli init-key`       | Create developer key if it doesn't exist               |
| `start-cli pubkey`         | Get public key for developer private key               |
| `start-cli init subscribe` | Subscribe to initialization progress                   |

---

## Querying Server State

These are the most useful commands for building a picture of the current server state. Prefer read-only commands and use `db dump` for structured data.

### Quick Health Check

```bash
# Is the server API up?
start-cli state

# CPU, RAM, disk, temperature
start-cli server metrics

# Uptime
start-cli server time

# Disk capacity and usage
start-cli disk list
```

### Installed Services

```bash
# List all installed packages with their status
start-cli package list

# Container resource usage (CPU, memory) per package
start-cli package stats

# Installed version of a specific package
start-cli package installed-version bitcoin

# Structured package data from the database (dump to file first)
start-cli db dump > /tmp/db_dump.json && jq '.value.packageData' /tmp/db_dump.json
```

### Available Packages (from Registry)

```bash
# List all packages available in a registry (no ID = list all)
start-cli -r https://registry.start9.com registry package get

# Details/installation candidates for a specific package
start-cli -r https://registry.start9.com registry package get bitcoin
```

### Networking

```bash
# Gateway/interface info
start-cli net gateway list

# Port forwards
start-cli net forward dump-table

# DNS table
start-cli net dns dump-table

# Virtual host proxy table
start-cli net vhost dump-table

# WiFi status
start-cli wifi get
```

### Notifications and Logs

```bash
# Recent notifications
start-cli notification list

# OS logs
start-cli server logs

# Kernel logs
start-cli server kernel-logs

# Package-specific logs
start-cli package logs bitcoin --limit 100
```

### Backups

```bash
# Available backup targets (disks, network shares)
start-cli backup target list

# Backup info for a specific target
start-cli backup target info <target-id>
```

### Full Database Dump

The database contains **local** server state only: installed package metadata, server info, and UI settings. It does **NOT** contain registry data — use `registry` commands to query available packages from a registry.

```bash
# Everything (public)
start-cli db dump

# Dump to file first, then use jq to extract specific sections
start-cli db dump > /tmp/db_dump.json
jq '.value.serverInfo' /tmp/db_dump.json
jq '.value.packageData' /tmp/db_dump.json
jq '.value.packageData.bitcoin' /tmp/db_dump.json
jq '.value.ui.registries' /tmp/db_dump.json
```

---

## Common Workflows

### Server Health Assessment

```bash
# 1. Check server is running
start-cli state

# 2. Check resources
start-cli server metrics
start-cli server time

# 3. Check disk space
start-cli disk list

# 4. Check for problems
start-cli notification list

# 5. Check service health
start-cli package list
start-cli package stats
```

### Install a Package from Registry

```bash
# 1. Browse available packages (no ID = list all)
start-cli -r https://registry.start9.com registry package get

# 2. Get details for a package
start-cli -r https://registry.start9.com registry package get bitcoin

# 3. Install it
start-cli package install bitcoin

# 4. Start the service
start-cli package start bitcoin

# 5. Verify it's running
start-cli package logs bitcoin --follow
```

### Development Workflow

```bash
# Initialize developer key
start-cli init-key

# Pack your project
start-cli s9pk pack ./my-project -o my-package.s9pk

# Sideload to test server
start-cli -H https://test-server.local package install --sideload ./my-package.s9pk

# Monitor the package
start-cli package logs my-package --follow
```

### Troubleshooting a Service

```bash
# 1. Check if service is running
start-cli package list

# 2. View recent logs
start-cli package logs bitcoin --limit 200

# 3. Check resource usage
start-cli package stats

# 4. Check server-level issues
start-cli server logs
start-cli server metrics

# 5. Try restarting the service
start-cli package restart bitcoin

# 6. If needed, rebuild the container
start-cli package rebuild bitcoin

# 7. Execute a command inside the container for debugging
start-cli package attach bitcoin ls /data
```
