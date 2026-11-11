# Deploy Azure Heroes to an Azure Web App

This guide covers **Azure App Service on Linux**, private Azure Table Storage,
and GitHub Actions deployment with OpenID Connect (OIDC). Bicep provisions
resources; the application is released separately. The server uses JSON locally
and requires the Azure Table adapter in hosted production.

> **First release gate:** the Web App is disabled by default. Keep it disabled
> until the deployment identity, managed-identity table permissions, private
> network path and reviewed release are ready. This repository has no production
> player data to migrate; if that changes, stop and plan a protected migration
> before switching traffic.

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

Local JSON mode in [server.js](../server.js) writes salted scrypt password
hashes, salts, hashed session tokens, progress and best scores into
`DATA_DIR/heroes.json` (default `./data/heroes.json`). Azure production stores
account records, session hashes, progress and leaderboard projections in their
separate private Tables. Plaintext passwords are never stored. Browser login
tokens are stored in `localStorage` under `azureheroes2027_token`; guest
progress uses `azureheroes2027`.

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
| `applicationEnabled` | **false** by default; enable after OIDC, managed identity, private network and release checks pass |
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

The app's production settings select the Table Storage adapter:
`PERSISTENCE_PROVIDER=azure-tables`, `AZURE_TABLE_ENDPOINT`, and
`AZURE_TABLE_ACCOUNTS`, `AZURE_TABLE_SESSIONS`, `AZURE_TABLE_PROGRESS`,
`AZURE_TABLE_LEADERBOARD`. Endpoint/table names are not secrets. The system-assigned
identity needs no configured client ID. The normal table endpoint stays in app
settings; private DNS resolves it to the private endpoint address.

### GitHub OIDC deployment

The [Actions workflow](../.github/workflows/azure-app-service.yml) no longer
uses a publish profile. The portal's “Basic authentication is disabled” message
for SCM basic authentication is expected; **do not enable it**. The workflow
authenticates with a short-lived GitHub OIDC token and packages the production
dependencies, so App Service does not have to build code or contact npm.

In Entra ID, create or select a **separate deployment identity** (not the Web
App's Table Storage managed identity). Add a federated credential with:

- Issuer: `https://token.actions.githubusercontent.com`
- Subject: `repo:azurekid/azureheroes:environment:production`
- Audience: `api://AzureADTokenExchange`

Assign that identity the built-in **Website Contributor** role scoped to the
single target Web App. It must not receive Table data roles, storage keys, or
resource-group/subscription Contributor. The Web App's system-assigned identity
separately keeps its four table-scoped data roles. Deployment remains privileged:
released code runs as the Web App identity, so protect `main`, require review,
and require production-environment approval.

Add these **Actions variables** to the GitHub `production` environment:

| Variable | Value |
|---|---|
| `AZURE_WEBAPP_NAME` | Exact Web App resource name (not its URL) |
| `AZURE_CLIENT_ID` | Client ID of the deployment identity with the federation above |
| `AZURE_TENANT_ID` | Entra tenant ID |
| `AZURE_SUBSCRIPTION_ID` | Subscription containing the target Web App |

These are identifiers, not credentials. The workflow has no publish-profile
secret. Limit the environment's allowed deployment branch to `main` and add
required reviewers. OIDC federation will fail if the environment name or subject
differs.

### Table Storage server integration and data handling

`server.js` selects `azure-tables` in Azure and validates the endpoint and all
four table names. It uses `ManagedIdentityCredential`, verifies access to every
configured table before listening, and exits on configuration, network or RBAC
failure. It does not silently fall back to JSON. Local development retains the
dependency-backed JSON store; only explicitly setting `PERSISTENCE_PROVIDER=json`
selects it.
Azure SDK transitive overrides in [package.json](../package.json) preserve the
repository's Node 18 support; dependency updates must continue to pass both
runtime validation jobs.

Account credentials remain salted scrypt hashes; sessions store only SHA-256
token hashes and are expired/revoked on every request. Progress writes merge with
ETag retries and are size-bounded. The leaderboard uses a reverse-score index;
score row and per-player locator are changed in a single-partition transaction.
Player counts read the account table. Scores are still browser-submitted and are
not authoritative anti-cheat evidence.

The app identity can read/write/delete only within the four table scopes. No
developer, deployment identity or public runner is granted access to player
data. The GitHub workflow packages no data or credentials. Table Storage has no
automatic entity TTL or backup: arrange restricted table exports, retention,
restore procedures and outage monitoring before real players. Blob soft
delete/versioning protects blobs, not Table entities.

No player-data migration is needed for the current deployment because there are
no existing production accounts. A production database outage must be treated
as an error; never recover by starting an empty local store. If legacy accounts
are later discovered, stop and design a separately approved private migration;
do not place exports in GitHub or open the private-storage firewall.

## Legacy JSON mode reference

The remaining legacy examples document the old single-file JSON host only. They
are not the deployment procedure for the Bicep-created Table Storage app and
should not be used for a new production deployment.

### 1. Hosting requirements and limits

| Setting | Required configuration |
|---|---|
| Publish model | Code, Linux |
| Runtime | Node 22 LTS, matching the deployment test job; confirm regional availability |
| Plan | A paid plan such as Basic B1 for a small deployment; check current regional pricing |
| Capacity | Exactly one instance and one Node process; no autoscale or PM2 cluster mode |
| Startup | `node server.js` (equivalent to the repository's `npm start`) |
| Data location | Legacy JSON only: `DATA_DIR=/home/data`, outside deployed application content |
| Port | Provided by App Service via `PORT`; do not hard-code or override it |
| Transport | HTTPS Only, minimum TLS 1.2; keep FTP publishing disabled |
| Availability | Always On on a supported plan |

The legacy JSON provider loads accounts and sessions into memory, then writes a
single `heroes.json` with an atomic rename. It has **no multi-process
coordination**. It is for local development or an explicitly managed old app,
not the current Table Storage production mode.

Built-in Linux App Service storage under `/home` persists across app restarts and
code deployments. Do not store legacy account data under `/tmp` or
`/home/site/wwwroot`. Persistent storage does not replace backups.

Accounts contain password hashes and session-token hashes. Never commit, include
in a deployment ZIP, expose publicly or paste `heroes.json` into support logs.
Names and locations are intentionally public on the leaderboard; do not use real
personal data for smoke-test accounts.

### 2. Optional legacy JSON-only Web App (not the Bicep deployment)

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
  --settings DATA_DIR=/home/data NODE_ENV=production PERSISTENCE_PROVIDER=json SCM_DO_BUILD_DURING_DEPLOYMENT=false
```

Alternatively use **Create Web App** in the Azure portal: Code, Linux, Node 22,
an appropriate region and a single-instance plan. Configure the same startup,
environment variables, HTTPS and Always On settings there. Do not let Deployment
Center overwrite the reviewed repository workflow with a second deploy pipeline.

The browser game needs no build. The server has pinned Azure Identity and Tables
runtime dependencies; the current workflow installs them and packages them
before deployment. Phaser is fetched by the player's browser from the pinned,
integrity-checked jsDelivr URL; that CDN must be reachable.

### 3. Configure and run the OIDC release

The [workflow](../.github/workflows/azure-app-service.yml) runs `npm ci` and
`npm test` before deployment. The production job installs only runtime packages,
packages the full game plus `node_modules`, signs in with GitHub OIDC, and uses
the pinned `azure/webapps-deploy` v3 action. No publish profile or player-data
file is included.

1. Create **Settings > Environments > production**. Restrict deployments to
   `main` and require reviewer approval where available.
2. Add the four Actions variables from the OIDC table above to this environment.
3. Configure the Entra federated credential and app-scoped Website Contributor
   role described above. Keep the Web App's FTP/SCM basic publishing auth disabled.
4. Ensure the Web App is enabled only after private Table endpoint DNS and its
   system-assigned identity's table roles are ready. If the deployed Bicep app is
   stopped, review and reapply `applicationEnabled=true` in the infrastructure
   deployment; do not broaden the deployment identity to the resource group.
5. Merge a reviewed commit to `main`. Approve the `production` environment job
   and confirm the tested commit and deployment result in **Actions**.
6. Complete the health, static-file and browser checks below before announcing
   the release. The workflow does not provision infrastructure or enable a
   stopped Web App.

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

**Backups:** this Bicep deployment does not configure Table Storage backups.
Before accepting player accounts, arrange scheduled, access-controlled Table
exports to a separately approved private destination, define retention, and
perform a restore drill. Blob soft delete/versioning protects blobs, not Table
entities. Keep exports out of GitHub Actions, repository files and logs.

**Restore:** use an approved maintenance window, preserve a restricted copy of
the current tables, restore a validated export, then verify registration/login,
progress and leaderboard consistency. Never restore an empty store over player
data. If a rollback requires moving accounts from the old JSON app, stop and
follow a separately reviewed migration plan.

**Code rollback:** use a reviewed revert on `main` and the normal OIDC workflow.
Re-running a workflow deploys that run's commit; inspect its exact revision.
Ensure the old code understands the current Table schema. Code deployment does
not restore account data. Avoid slots until separate persistence and traffic
isolation are designed and tested.

**Monitoring:** use App Service health checks for `/api/health`, availability
monitoring and restricted platform logs. Startup checks Table access before
listening; `/api/health` is a liveness check and does not continuously query
Table Storage. Review restarts, storage failures and response times; no
Application Insights instrumentation is installed by this guide.
Stop or remove only dedicated resources after confirming data retention needs;
an App Service plan can continue to incur charges when its app is stopped.

### 7. Troubleshooting

| Symptom | Check |
|---|---|
| Deploy job is skipped | `AZURE_WEBAPP_NAME` exists in the `production` environment; test job passed |
| Job waits or branch is rejected | `production` reviewers and allowed deployment branches |
| OIDC login fails | Check all four environment variables, federation issuer/subject/audience, deployment identity and app-scoped Website Contributor role |
| 401/403 during deploy | Keep SCM basic auth disabled; check the federated deployment identity's role scope and the production environment subject |
| 502/503 or startup failure | Node 22, root-level `server.js`/`package.json`/`table-store.js`, packaged `node_modules`, App Service logs, private DNS and managed-identity table roles |
| Blank game, missing module 404s | ZIP includes `audio/`, `worlds/` and `node_modules`; inspect browser network and hard-refresh |
| Guest mode only | `/api/health` answers on the same origin; a static host has no account API |
| Table-backed app fails to start | Verify exact `PERSISTENCE_PROVIDER=azure-tables`, endpoint/table names, private endpoint DNS and RBAC propagation; do not switch to JSON as a workaround |
| Progress intermittently disappears | Check Table request errors and retry behavior; local JSON mode is not safe for multiple writers |
| Old art after a successful deploy | Cached scripts; hard-refresh and check the deployed commit |
| CDN or integrity error | Client network access to pinned jsDelivr Phaser URL; do not disable SRI/CSP to bypass it |

App Service **Log stream** and **Diagnose and solve problems** can help with
startup failures. Keep logs private and do not capture passwords, session
tokens, OIDC tokens or account-store contents.

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
