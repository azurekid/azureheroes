# Deploy Azure Heroes to an Azure Web App

This guide covers **Azure App Service on Linux** and the approved
**private Azure Table Storage** infrastructure. Bicep templates provision resources,
not the application adapter or data migration. Commands are examples for a
maintainer to run after reviewing cost, subscription and permissions; creating
these files does not provision or deploy anything.

> **Production blocker:** current `server.js` still uses a local JSON file.
> The new table settings are not consumed yet. The Bicep Web App is **stopped by
> default**; do not enable it, deploy the current account server to it, or enable
> its production Actions release until the integration checklist below is complete.
> Merely creating storage does not move or protect existing account data.

For static guest-only hosting, see [the README](../README.md#static-hosting-guest-mode).
For release protections and private reporting, follow [SECURITY.md](../SECURITY.md).

## Recommended resources: managed identity and private Table Storage

| Resource | Purpose |
|---|---|
| Linux B1 App Service plan + Node 22 Web App | Serves the game and same-origin account/dashboard API |
| System-assigned managed identity | Requests Entra access tokens for Table Storage; no database password/client secret |
| StorageV2 account | Low-volume, transaction-priced entity storage; LRS by default, optional ZRS |
| `accounts` table | Normalized unique account identifiers, salted password hashes and private account metadata |
| `sessions` table | Hashed session tokens, account reference, expiry/revocation state |
| `progress` table | Per-player resume, route, bests and collected wardrobe |
| `leaderboard` table | Public-only score projection/index for the dashboard; no hashes or session data |
| VNet, delegated `/26` app subnet, separate `/27` endpoint subnet and NSG | Outbound app-to-storage HTTPS, without public storage access |
| Table private endpoint + linked private DNS zone | Resolves the normal table hostname privately within the app VNet |
| Four table-scoped RBAC assignments | App identity gets Storage Table Data Contributor on these tables only |

No Cosmos DB, Key Vault, storage keys, SAS tokens, connection strings or client
secrets are required for this design. Managed identity identifies the **server**,
not a player; the app must still validate each player's session and authorize
every private operation.

### Where credentials live today, and what changes

Today [server.js](../server.js) writes salted scrypt password hashes, salts,
hashed session tokens, progress and best scores into `DATA_DIR/heroes.json`
(default `./data/heroes.json`; legacy Azure setup `/home/data/heroes.json`).
Plaintext passwords are not stored. Browser login tokens are stored in
`localStorage` under `azureheroes2027_token`; guest progress uses
`azureheroes2027`. The leaderboard API reads public projections from the
server's in-memory copy, not a separate dashboard database.

Publishing the hashing algorithm does not make hashes decryptable: password
hashing is one-way. Stolen hashes can still be attacked by password guessing,
so both storage access and password policy matter. The server's static allowlist
excludes account data; `data/` is git-ignored and omitted from deployment packages.
These controls do not undo a past accidental commit or data exposure.

Repository contributors must have **no production data-plane role**, storage
keys, Azure console/SSH access or unrestricted deployment permission. Private
networking and RBAC protect against direct access, but malicious code approved
for deployment could use the app identity's legitimate access. Require trusted
reviews, protected `main`, production approvals, least-privilege Azure roles and
isolated test data. Bicep cannot enforce those organizational boundaries.

Key Vault is for application secrets (for example a future third-party API
credential or separately designed password pepper), **not individual player
passwords, hashes or progress**. Add a private, RBAC-enabled vault with purge
protection only when such a secret is actually introduced. Do not copy users'
login records into it.

### Cost and durability choices

Table Storage avoids provisioned database throughput and is appropriate for a
small community game, but does not support arbitrary sorted leaderboard queries.
It needs a deliberate index and concurrency logic, described below. A JSON blob
would still need single-writer coordination and would not solve that problem.

B1, a Table private endpoint (hourly plus data-processing costs), private DNS and
storage transactions/capacity all incur charges. Review current regional prices;
no monthly cost is quoted here. One B1 instance and LRS are cost choices, **not
zone/region high availability**. ZRS improves storage resilience where available,
but is not a backup. No automatic backup service, monitoring workspace,
Application Insights instrumentation, custom domain or WAF is provisioned.

## Provision the approved infrastructure with Bicep

Entry point: [infra/main.bicep](../infra/main.bicep).
Example parameters: [infra/main.bicepparam](../infra/main.bicepparam).
The approved design is recorded in
[the infrastructure plan](../.azure/infrastructure-plan.json).
Modules separate networking, storage, compute and table-scoped authorization.
No live Azure resources were inventoried; this creates a **new standalone app
and plan**, not an update to an existing production Web App.

Parameters:

| Parameter | Default / meaning |
|---|---|
| `location` | Resource group location; example parameter file uses `westeurope` |
| `environmentName` | `prod`; allowed `dev`, `test`, `prod`; use separate resource groups |
| `storageSku` | `Standard_LRS`; optional `Standard_ZRS` after availability/cost review |
| `applicationEnabled` | **false** until the adapter, migration and acceptance gates pass |
| `tags` | Additional non-sensitive tags |

Names use a deterministic subscription/resource-group/environment suffix.
The VNet uses `10.77.0.0/24`; check for address overlap before future peering.
The app remains publicly reachable over HTTPS once enabled, because it serves
community players; **the storage account's public network and Shared Key access
are disabled**. FTP and SCM basic publishing authentication are also disabled.

Use an up-to-date Azure CLI/Bicep compiler. Confirm subscription, region/SKU
availability, quota and policy first. The deployment identity needs resource
creation rights **and** role-assignment rights at the target resource group
(for example a deliberately scoped Contributor plus Role Based Access Control
Administrator, granted by an authorized administrator). Ordinary app code
deployment must not get those infrastructure/RBAC rights.

```bash
az login
az account set --subscription "<subscription-id>"
az account show --query "{name:name,id:id}" --output table
az webapp list-runtimes --os linux --output table

RG="azureheroes-prod-rg"
LOCATION="westeurope"
az group create --name "$RG" --location "$LOCATION"

# Compile only; do not commit generated ARM JSON.
az bicep build --file infra/main.bicep --stdout > /dev/null
az bicep build-params --file infra/main.bicepparam --stdout > /dev/null
npm test

# Preview first; review every proposed resource, role assignment and cost.
az deployment group what-if --resource-group "$RG" \
  --template-file infra/main.bicep --parameters infra/main.bicepparam

# Execute only after explicit maintainer approval of the preview.
az deployment group create --name azureheroes-infra --resource-group "$RG" \
  --mode Incremental --template-file infra/main.bicep \
  --parameters infra/main.bicepparam

# Outputs contain names, resource endpoints and identity IDs, never secrets.
az deployment group show --name azureheroes-infra --resource-group "$RG" \
  --query properties.outputs --output json
```

Edit the example parameters before previewing if `westeurope` is not your target.
These commands have **not** been run against an Azure subscription as part of
template creation. Local compilation does not verify quota, regional API/SKU
availability, Azure Policy or deployed network connectivity. Recent resource
API versions produce BCP081 warnings with the tested compilers; recheck with
newer releases and require Azure validation/what-if before deployment.

### Local validation evidence and remaining gates

- Both installed Bicep 0.47.16 and an isolated 0.48.1 compiled the entry template
  and parameters successfully (exit 0). Both report **BCP081** for the newly
  documented Storage `2026-09-01` and Network `2026-03-01` APIs. Their local type
  catalogues cannot validate those properties; upgrading alone did not remove
  the warnings. Properties were checked against published resource references,
  but Azure-side validation/what-if is still required. No warnings were suppressed.
- Checkov `-d infra/ --skip-download` reported **24 passed, 7 failed, 0 skipped,
  1 parsing error**: its Bicep parser could not parse the existing-resource
  collection used for table RBAC. Scanning the compiler-generated ARM instead
  avoids that parsing limitation and reports the same seven policy findings.
- Neither scan is a clean security approval. Findings are retained, not
  blanket-skipped; a maintainer must review the tradeoffs before deployment:

| Checkov policy | Disposition |
|---|---|
| `CKV_AZURE_222` public Web App | Intentional public game ingress; Table Storage stays private |
| `CKV_AZURE_17` incoming client certificates | Not required for public browser players; HTTPS and application sessions remain mandatory |
| `CKV_AZURE_225`, `CKV_AZURE_212` zone redundancy / failover instances | Deliberate B1 single-instance budget choice; no HA claim |
| `CKV_AZURE_206` storage replication | Default LRS budget choice; evaluate ZRS or a separately designed regional recovery plan |
| `CKV_AZURE_36` trusted-services bypass | Deliberately `None`: broader trusted-service firewall bypass is not needed for the private endpoint |
| `CKV_AZURE_43` storage naming | Scanner cannot evaluate the nested parameterized name; entry template generates only `stah` + allowed environment + 13-character unique suffix, within account naming limits |

This evidence is local and does not establish a severity-rated vulnerability
assessment or absence of other issues. Before real users, resolve policy
exceptions through the release/security process, validate in the chosen
subscription, and complete the adapter, backup and recovery gates below.

The template's app settings reserve the future adapter contract:
`PERSISTENCE_PROVIDER=azure-tables`, `AZURE_TABLE_ENDPOINT`, and
`AZURE_TABLE_ACCOUNTS`, `AZURE_TABLE_SESSIONS`, `AZURE_TABLE_PROGRESS`,
`AZURE_TABLE_LEADERBOARD`. Endpoint/table names are not secrets. The system-assigned
identity needs no configured client ID. The normal table endpoint stays in app
settings; private DNS resolves it to the private endpoint address.

### Code publishing is separate

The existing [Actions workflow](../.github/workflows/azure-app-service.yml) uses
a **publish profile**, so it is intentionally incompatible with the new
template's disabled SCM basic authentication. Leave its `AZURE_WEBAPP_NAME`
unset for the new app. Do not enable basic auth just to make that workflow run.

A separate reviewed workflow update should use GitHub OIDC with app-scoped
deployment permissions and a `production`-environment federation subject,
`azure/login`, and job-scoped `id-token: write`. Pin every new action by reviewed
commit SHA. The deployer must not receive Table data roles or storage account
key permissions. Code-deployment rights are nevertheless highly trusted because
deployed code can run as the app identity. Alternatively, an authorized maintainer
can publish an approved ZIP using Entra-authenticated Azure CLI when integration
is ready. Do not deploy credentials or migration files in either path.

## Server integration and migration: required before enabling accounts

**Not implemented by these templates.** No database SDK or server behavior has
changed. Do not treat the planned environment variables as an active switch:
current `server.js` ignores them and still uses JSON.

1. Implement a persistence adapter using reviewed Azure Identity and Tables SDKs
   (or a reviewed equivalent). Use managed identity in Azure and explicit Entra
   developer identity for isolated local tests. Never use keys, client secrets,
   production account exports or browser-side Table access.
2. Select `azure-tables` explicitly in hosted environments, validate all required
   configuration, and **fail startup/readiness on missing permissions, network
   failures or malformed data**. Do not fall back to an empty JSON store or
   persist a second copy of accounts locally. Keep explicit JSON guest/local
   development mode separate.
3. Design stable entity keys: unique normalized account names must use
   create-if-absent, not overwrite/upsert on registration. Use ETags and bounded
   retry/re-read/merge on concurrent progress updates to preserve monotonic route,
   score and wardrobe unions. Enforce Table entity/property size limits before
   writes; progress JSON cannot grow without bounds.
4. Preserve salted scrypt hashes and salt parameters; never migrate plaintext
   passwords or try to decrypt hashes. Store only session-token hashes; check
   expiry/revocation on every request. Table Storage has no automatic session TTL,
   so implement expiry cleanup without logging credentials. Consider invalidating
   existing sessions at migration and requiring fresh login.
5. Build the public leaderboard projection/index deliberately. Table Storage
   cannot perform the existing in-memory `ORDER BY score`/rank calculation.
   One design uses a fixed leaderboard partition with fixed-width reverse-score,
   tie-break timestamp and player ID in the RowKey. Update/remove old index entries
   safely (same-partition transactions where applicable), handle races/retries and
   repair stale projections. Define accurate rank/player counts and pagination;
   never copy hashes, salts or sessions into leaderboard entities/responses.
6. Preserve public profile shapes, register/login/logout, selected start,
   Continue, non-prefix route merges, wardrobe, bounded scores and Hacker
   sandbox no-writes. A database does not make browser-submitted scores authoritative.
7. Migrate only during an approved maintenance window: stop the legacy writer,
   take a restricted backup, validate/count source records, import idempotently
   from a trusted private-network execution environment, reconcile projections,
   and test restore/rollback before switching traffic. Keep data out of GitHub
   Actions logs/artifacts and repository files. A normal public CI runner cannot
   access this private data plane; do not open the firewall to work around that.
8. Test DNS resolving the storage endpoint privately, allowed managed-identity
   data access and denial of anonymous/key/public access. RBAC propagation can
   take time; readiness must report failure rather than pretend success.
9. Run negative/auth/concurrency/migration tests and staging browser checks.
   Confirm cross-device progress and leaderboard consistency after app restart;
   test storage-outage behavior and ensure no private data reaches logs/static files.
10. Establish restricted scheduled table exports/backups, retention, recovery
    procedures and monitoring. Blob soft delete/versioning protects **blobs**, not
    Table entities; adding a private export destination requires a separately
    reviewed resource/access path. After all gates pass, deploy reviewed adapter
    code while stopped and deliberately set `applicationEnabled=true`.

The app identity can read/write/delete data and tables only within the four
assigned table scopes. These assignments grant nothing to repository contributors.
Control-plane administrators may still be able to change RBAC or network settings;
audit and restrict those rights separately. Keep the existing single-process
restriction until the adapter and concurrency acceptance tests remove it.

## Legacy JSON hosting reference

The remaining sections describe the **existing JSON-backed application only**,
for local development or an explicitly accepted legacy deployment. They do not
implement Table Storage and must not be used as the new production architecture.

### 1. Hosting requirements and limits

| Setting | Required configuration |
|---|---|
| Publish model | Code, Linux |
| Runtime | Node 22 LTS, matching the deployment test job; confirm regional availability |
| Plan | A paid plan such as Basic B1 for a small deployment; check current regional pricing |
| Capacity | Exactly one instance and one Node process; no autoscale or PM2 cluster mode |
| Startup | `node server.js` (equivalent to the repository's `npm start`) |
| Data location | `DATA_DIR=/home/data`, outside deployed application content |
| Port | Provided by App Service via `PORT`; do not hard-code or override it |
| Transport | HTTPS Only, minimum TLS 1.2; keep FTP publishing disabled |
| Availability | Always On on a supported plan |

The server loads accounts and sessions into memory, then writes a single
`heroes.json` with an atomic rename. It has **no multi-process coordination**.
Shared storage, sticky sessions or a faster plan do not make concurrent writers
safe. Keep a single writer; migrate persistence to a concurrency-safe database
before adding instances/workers or slots that share the data directory.

Built-in Linux App Service storage under `/home` persists across app restarts and
code deployments. Do not store account data under `/tmp` or `/home/site/wwwroot`,
and do not use a read-only deployment mount for `DATA_DIR`. Persistent storage
does not replace backups or protect against accidental deletion/corruption.

Accounts contain password hashes and session-token hashes. Never commit, include
in a deployment ZIP, expose publicly or paste `heroes.json` into support logs.
Names and locations are intentionally public on the leaderboard; do not use real
personal data for smoke-test accounts.

### 2. Create and configure the legacy Web App

Prerequisites: an Azure subscription, permissions to create/configure App Service
resources, a reviewed repository checkout, Node 22, `zip`, and Azure CLI (or Azure
Cloud Shell). GitHub Actions deployment also requires repository/environment
administration. No application package installation is necessary.

First authenticate and choose the intended subscription:

```bash
az login
az account set --subscription "<subscription-id>"
az account show --query "{name:name,id:id}" --output table
az webapp list-runtimes --os linux --output table
```

Confirm `NODE:22-lts` is offered. If it is unavailable, stop and choose a supported
runtime only after testing it and updating the workflow/documentation together.
Do not silently substitute an obsolete runtime.

The following Bash examples create billable resources. Set your own names and
region; the app name must be globally unique. These are hosting settings,
independent of the starting region a player selects in the game.

```bash
RG="azureheroes-prod-rg"
LOCATION="westeurope"
PLAN="azureheroes-prod-plan"
APP="<globally-unique-web-app-name>"

az group create --name "$RG" --location "$LOCATION"
az appservice plan create --name "$PLAN" --resource-group "$RG" \
  --location "$LOCATION" --is-linux --sku B1 --number-of-workers 1
az webapp create --name "$APP" --resource-group "$RG" \
  --plan "$PLAN" --runtime "NODE:22-lts"

az webapp update --name "$APP" --resource-group "$RG" --https-only true
az webapp config set --name "$APP" --resource-group "$RG" \
  --startup-file "node server.js" --always-on true \
  --min-tls-version 1.2 --ftps-state Disabled
az webapp config appsettings set --name "$APP" --resource-group "$RG" \
  --settings DATA_DIR=/home/data NODE_ENV=production SCM_DO_BUILD_DURING_DEPLOYMENT=false
```

Alternatively use **Create Web App** in the Azure portal: Code, Linux, Node 22,
an appropriate region and a single-instance plan. Configure the same startup,
environment variables, HTTPS and Always On settings there. Do not let Deployment
Center overwrite the reviewed repository workflow with a second deploy pipeline.

No `npm install` or build is needed: all JavaScript is checked in and
`package.json` has no dependencies. Phaser is fetched by the player's browser
from the pinned, integrity-checked jsDelivr URL; that CDN must be reachable.

### 3. Configure legacy GitHub Actions deployment

The existing [workflow](../.github/workflows/azure-app-service.yml):

1. Runs `npm test` on Node 22 on pushes to `main` or manual dispatch.
2. Deploys only after tests pass and `AZURE_WEBAPP_NAME` is configured.
3. Uses the GitHub `production` environment.
4. Packages the game, shared audio, city modules and account server.
5. Publishes to the named Web App using its publish profile.

### Protections

- Protect `main` and require reviewed PRs and passing validation.
- Create **Settings > Environments > production**, allow only `main`, and enable
  required reviewers where your GitHub plan supports them. If reviewers are not
  available, use an equivalent organizational release approval before production.
- Manual dispatch can select a branch; the environment branch restriction must
  reject anything other than `main`.
- Add repository **Actions variable** `AZURE_WEBAPP_NAME` with the app's name,
  not its URL. The workflow skips deployment when this variable is empty.
- Add **environment secret** `AZURE_WEBAPP_PUBLISH_PROFILE` to `production`
  containing the complete downloaded publish-profile XML. The workflow also
  supports a repository secret with that name, but environment scope is preferable.

### Publish-profile credentials

The current workflow uses a publish profile, **not OIDC**. It requires
**SCM Basic Auth Publishing Credentials** to be enabled on the Web App. This is
deployment authentication, not the game's player login. Keep FTP basic
authentication disabled.

Obtain maintainer/security approval before enabling SCM basic auth. In the Azure
portal, configure the SCM publishing setting under the Web App's configuration
settings, then download the profile from **Overview > Download publish profile**.
Microsoft's Linux publish-profile guidance also calls for
`WEBSITE_WEBDEPLOY_USE_SCM=true` before downloading:

```bash
az webapp config appsettings set --name "$APP" --resource-group "$RG" \
  --settings WEBSITE_WEBDEPLOY_USE_SCM=true
```

Treat the XML as a deployment credential: place it directly in GitHub's secret UI,
never in source control, chat, logs or artifacts. Remove the local download after
storing it securely. Rotate/reset publishing credentials if exposed and update
the secret. Never retrieve or print an existing production credential for debugging.

If policy forbids basic authentication, **do not weaken policy** to use this
workflow. Microsoft recommends OpenID Connect: a separately reviewed migration
must configure an Entra federated identity, app-scoped deployment permissions,
`azure/login`, `id-token: write` for the deployment job, and remove the publish
profile. The current workflow does not implement that path.

### First release

Run local tests, then merge through the protected branch:

```bash
npm test
```

Open **Actions > Deploy to Azure App Service**, inspect the tested commit, approve
the `production` deployment if required, and wait for both jobs. For manual
dispatch select `main`. Do not launch a manual ZIP deployment while Actions is
deploying. Complete the smoke checks below before announcing the release.

### 4. Optional manual ZIP deployment

Use this only for an explicitly approved manual release, authenticated through
Azure CLI. Skip it when using GitHub Actions. Run from the repository root.

```bash
npm test
PACKAGE_DIR="$(mktemp -d)"
zip -r "$PACKAGE_DIR/azureheroes.zip" \
  index.html server.js package.json art audio worlds ui levels systems docs/screenshots
unzip -l "$PACKAGE_DIR/azureheroes.zip"

az webapp deploy --name "$APP" --resource-group "$RG" \
  --src-path "$PACKAGE_DIR/azureheroes.zip" --type zip

rm "$PACKAGE_DIR/azureheroes.zip"
rmdir "$PACKAGE_DIR"
```

The ZIP must contain `index.html`, `server.js` and `package.json` at its root,
not inside a repository folder. Keep `worlds/` and `audio/`: they are explicitly
loaded by `index.html`, and leaving them out prevents game startup.
The archive must exclude `data/`, `.git/`, `.github/`, test accounts, local
configuration and credentials. Do not replace the explicit file list with `zip .`.

### 5. Verify the deployment

Resolve the actual hostname rather than assuming a hostname format:

```bash
HOST="$(az webapp show --name "$APP" --resource-group "$RG" \
  --query defaultHostName --output tsv)"
BASE="https://$HOST"

curl --fail --silent --show-error "$BASE/api/health"
curl --fail --silent --show-error --output /dev/null "$BASE/"
curl --fail --silent --show-error --output /dev/null "$BASE/worlds/catalogue.js"
curl --fail --silent --show-error --output /dev/null "$BASE/audio/composition.js"
```

`/api/health` should return `{"ok":true,"game":"azure-heroes-2027"}`. Check all local scripts, not just
the health endpoint: a running server can still serve an incomplete package.
The directory layout is case-sensitive on Linux.

```bash
node -e 'const fs=require("node:fs"); const html=fs.readFileSync("index.html","utf8"); for(const m of html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) if(!/^https?:/.test(m[1])) console.log(m[1]);' |
while IFS= read -r script; do
  curl --fail --silent --show-error --output /dev/null "$BASE/$script" || exit 1
done

for private_path in server.js package.json data/heroes.json .github/workflows/azure-app-service.yml; do
  code="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' "$BASE/$private_path")"
  test "$code" = 404 || { printf 'Unexpected response for %s: %s\n' "$private_path" "$code"; exit 1; }
done
```

Then verify in a browser:

- Title, Hero Lab, music after user interaction, all world-map pins and no
  missing scripts, CSP/SRI failures or runtime exceptions.
- Register a dedicated test hero, choose a represented starting region and use
  Continue. A local guide must wait for acknowledgment before play.
- Log out/in and reload to verify account adoption. Use a second browser profile
  to confirm synchronization without relying on the first profile's localStorage.
- Check free textured hair and hijab, and locked collectible hats. Confirm random
  next-world/Continue behavior using a non-production test environment or a normal
  playthrough; do not submit assisted scores to the public leaderboard.
- Restart the app once during an approved maintenance window, then confirm the
  test account can still log in. This checks data persistence, not backup recovery.
- Hard-refresh after a release: JavaScript is cached for up to one hour while
  `index.html` is not cached.

The repository's automated/browser checks are not proof that your Azure resource,
credentials, storage permissions or release protections are configured correctly.

### 6. Backups, rollback and operations

**Backups:** arrange scheduled, access-controlled backups of `/home/data/heroes.json`
and test recovery. App Service built-in backup features depend on the plan; do
not assume B1 includes them. Use an approved backup/storage process when they
are unavailable. Restrict access, encrypt backups, define retention and keep
them out of repository Actions artifacts.

For a consistent manual snapshot, stop writes during maintenance (for example
stop the Web App), copy the file using an approved restricted storage tool, then
restart and verify. The server flushes pending writes on graceful shutdown, but
abrupt termination can still lose recent writes. Verify backup timestamps and
restore capability rather than relying on shutdown alone.

**Restore:** stop the only app instance before replacing the store, retain a
secured copy of the current data, restore a validated backup to the same path,
then restart and check login/progress. Never restore an empty store over player
data. The current loader can start with an empty in-memory store if reading the
JSON fails; an apparently healthy process is not proof that accounts were loaded.

**Code rollback:** back up data first. Use a reviewed revert on `main` and the
normal workflow, or an approved ZIP of the last known-good revision. Re-running
a workflow deploys that run's commit; inspect its exact revision. Ensure the old
code understands the current save/store schema before rollback. Code deployment
does not restore account data. Avoid slot swaps until persistence isolation and
single-writer behavior are designed and tested.

**Monitoring:** use App Service health checks for `/api/health`, availability
monitoring and restricted platform logs. This endpoint checks the server, not
database integrity. Review restarts, errors, disk capacity and response times;
no Application Insights instrumentation is installed by this guide.
Stop or remove only dedicated resources after confirming data retention needs;
an App Service plan can continue to incur charges when its app is stopped.

### 7. Troubleshooting

| Symptom | Check |
|---|---|
| Deploy job is skipped | Repository variable `AZURE_WEBAPP_NAME` is set; test job passed |
| Job waits or branch is rejected | `production` reviewers and allowed deployment branches |
| Publish-profile authentication fails | Correct app/profile secret, SCM basic-auth approval/settings, profile rotation and SCM network access; do not print the secret |
| 502/503 or startup failure | Linux Node runtime, root-level `server.js`/`package.json`, startup `node server.js`, platform logs and no custom `PORT` |
| Blank game, missing module 404s | ZIP includes `audio/` and `worlds/`; inspect browser network and hard-refresh |
| Guest mode only | `/api/health` answers on the same origin; a static host has no account API |
| Accounts disappear after restart | `DATA_DIR` points to persistent `/home/data`; check permissions, JSON validity and backup before allowing further writes |
| Progress intermittently disappears | More than one instance/process or another slot is writing the store |
| Old art after a successful deploy | Cached scripts; hard-refresh and check the deployed commit |
| CDN or integrity error | Client network access to pinned jsDelivr Phaser URL; do not disable SRI/CSP to bypass it |

App Service **Log stream** and **Diagnose and solve problems** can help with
startup failures. Keep logs private and do not capture passwords, session
tokens, publish profiles or account-store contents.

## References

- [Configure Node.js on App Service](https://learn.microsoft.com/en-us/azure/app-service/configure-language-nodejs)
- [Deploy to App Service with GitHub Actions](https://learn.microsoft.com/en-us/azure/app-service/deploy-github-actions)
- [Disable or manage basic publishing authentication](https://learn.microsoft.com/en-us/azure/app-service/configure-basic-auth-disable)
- [App Service Linux persistent files](https://learn.microsoft.com/en-us/troubleshoot/azure/app-service/faqs-app-service-linux#i-m-using-my-own-custom-container--i-want-the-platform-to-mount-an-smb-share-to-the--home--directory-)
- [Back up an App Service app](https://learn.microsoft.com/en-us/azure/app-service/manage-backup)
- [Azure Table Storage overview](https://learn.microsoft.com/en-us/azure/storage/tables/table-storage-overview)
- [Authorize Table access with Microsoft Entra ID](https://learn.microsoft.com/en-us/azure/storage/tables/authorize-access-azure-active-directory)
- [Assign data roles at table scope](https://learn.microsoft.com/en-us/azure/storage/tables/assign-azure-role-data-access)
- [Storage private endpoints and DNS](https://learn.microsoft.com/en-us/azure/storage/common/storage-private-endpoints)
- [Prevent Shared Key authorization](https://learn.microsoft.com/en-us/azure/storage/common/shared-key-authorization-prevent)
- [Table service data model and limits](https://learn.microsoft.com/en-us/rest/api/storageservices/understanding-the-table-service-data-model)
