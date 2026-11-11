'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('infrastructure is private, keyless and disabled until the explicit release gate passes', () => {
  const main = read('infra/main.bicep'), web = read('infra/modules/web.bicep');
  const storage = read('infra/modules/storage.bicep'), access = read('infra/modules/table-access.bicep');
  const network = read('infra/modules/network.bicep');
  assert.match(main, /targetScope = 'resourceGroup'/);
  assert.match(main, /param applicationEnabled bool = false/);
  assert.match(read('infra/main.bicepparam'), /param applicationEnabled = false/);
  assert.match(web, /enabled: applicationEnabled/);
  assert.match(web, /type: 'SystemAssigned'/);
  assert.match(web, /virtualNetworkSubnetId: integrationSubnetId/);
  assert.match(web, /linuxFxVersion: 'NODE\|22-lts'/);
  assert.match(web, /httpsOnly: true/);
  assert.match(web, /ftpsState: 'Disabled'/);
  assert.match(web, /minTlsVersion: '1\.2'/);
  assert.match(web, /scmMinTlsVersion: '1\.2'/);
  for (const name of ['ftp', 'scm']) assert.match(web, new RegExp("name: '" + name + "'\\s+properties: \\{\\s+allow: false"));
  for (const setting of ['PERSISTENCE_PROVIDER', 'AZURE_TABLE_ENDPOINT', 'AZURE_TABLE_ACCOUNTS',
    'AZURE_TABLE_SESSIONS', 'AZURE_TABLE_PROGRESS', 'AZURE_TABLE_LEADERBOARD']) {
    assert.ok(web.includes("name: '" + setting + "'"));
  }
  assert.match(storage, /publicNetworkAccess: 'Disabled'/);
  assert.match(storage, /allowSharedKeyAccess: false/);
  assert.match(storage, /allowBlobPublicAccess: false/);
  assert.match(storage, /minimumTlsVersion: 'TLS1_2'/);
  assert.match(storage, /supportsHttpsTrafficOnly: true/);
  assert.match(storage, /defaultAction: 'Deny'/);
  assert.match(storage, /bypass: 'None'/);
  assert.match(storage, /groupIds: \[\s+'table'/);
  assert.match(storage, /privatelink\.table\.\$\{environment\(\)\.suffixes\.storage\}/);
  assert.match(storage, /virtualNetwork: \{\s+id: virtualNetworkId/);
  assert.match(storage, /privateDnsZoneId: dns\.id/);
  for (const name of ['accounts', 'sessions', 'progress', 'leaderboard']) {
    assert.ok(main.includes(name + ": '" + name + "'"));
  }
  assert.match(access, /0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3/);
  assert.match(access, /scope: tables\[i\]/);
  assert.match(access, /principalType: 'ServicePrincipal'/);
  assert.match(access, /principalId: principalId/);
  assert.match(network, /name: 'app-integration'[\s\S]+addressPrefix: '10\.77\.0\.0\/26'/);
  assert.match(network, /serviceName: 'Microsoft\.Web\/serverFarms'/);
  assert.match(network, /name: 'private-endpoints'[\s\S]+addressPrefix: '10\.77\.0\.64\/27'/);
  assert.match(network, /privateEndpointNetworkPolicies: 'Enabled'/);
  assert.match(network, /name: 'DenyOtherInbound'/);
  for (const text of [main, web, storage, access, network]) {
    assert.doesNotMatch(text, /listKeys\(|listAccountSas\(|AccountKey=|SharedAccessSignature=|Microsoft\.KeyVault\/vaults/);
  }
});

test('documentation gates release and separates player, storage and deployment identities', () => {
  const doc = read('docs/deployment-azure-web-app.md');
  assert.match(doc, /First release gate/);
  assert.match(doc, /SCM basic authentication/);
  assert.match(doc, /uses `ManagedIdentityCredential`/);
  assert.match(doc, /does not silently fall back to JSON/);
  assert.match(doc, /automatic entity TTL or backup/);
  assert.match(doc, /GitHub OIDC deployment/);
  assert.match(doc, /AZURE_CLIENT_ID/);
  assert.match(doc, /Website Contributor/);
  assert.match(doc, /four table-scoped data roles/);
  assert.doesNotMatch(doc, /AZURE_WEBAPP_PUBLISH_PROFILE/);
  assert.match(doc, /Key Vault is for application secrets/);
  assert.match(doc, /az deployment group what-if/);
  assert.match(doc, /--mode Incremental/);
  const plan = JSON.parse(read('.azure/infrastructure-plan.json'));
  assert.equal(plan.meta.status, 'approved');
  assert.equal(plan.plan.resources.some(r => r.type.startsWith('Microsoft.DocumentDB')), false);
  const names = new Set(plan.plan.resources.map(r => r.name));
  for (const resource of plan.plan.resources) for (const dependency of resource.dependencies) {
    assert.ok(names.has(dependency), dependency);
  }
});
