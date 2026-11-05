@description('Region shared by the app, Linux plan and integration VNet.')
param location string

@description('Environment and deterministic uniqueness suffix supplied by the entry template.')
param nameSuffix string

@description('Subnet delegated to Microsoft.Web/serverFarms.')
param integrationSubnetId string

@description('Normal HTTPS Table Storage endpoint; private DNS handles private routing. This is not a connection string.')
param tableEndpoint string

@description('Fixed account, session, progress and leaderboard table names.')
param tableNames object

@description('Default false. Enable only after deploying and verifying the future Table Storage adapter, not the current JSON-backed server.')
param applicationEnabled bool

@description('Non-sensitive resource tags.')
param tags object

resource plan 'Microsoft.Web/serverfarms@2025-03-01' = {
  name: 'asp-azureheroes-${nameSuffix}'
  location: location
  tags: tags
  kind: 'linux'
  sku: {
    name: 'B1'
    tier: 'Basic'
    capacity: 1
  }
  properties: {
    reserved: true
  }
}

resource app 'Microsoft.Web/sites@2025-03-01' = {
  name: 'app-azureheroes-${nameSuffix}'
  location: location
  tags: tags
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: plan.id
    enabled: applicationEnabled
    httpsOnly: true
    publicNetworkAccess: 'Enabled'
    virtualNetworkSubnetId: integrationSubnetId
    siteConfig: {
      linuxFxVersion: 'NODE|22-lts'
      appCommandLine: 'node server.js'
      alwaysOn: true
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      scmMinTlsVersion: '1.2'
      http20Enabled: true
      remoteDebuggingEnabled: false
      healthCheckPath: '/api/health'
      appSettings: [
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'false'
        }
        // These are the future adapter's contract, not settings consumed by current server.js.
        {
          name: 'PERSISTENCE_PROVIDER'
          value: 'azure-tables'
        }
        {
          name: 'AZURE_TABLE_ENDPOINT'
          value: tableEndpoint
        }
        {
          name: 'AZURE_TABLE_ACCOUNTS'
          value: tableNames.accounts
        }
        {
          name: 'AZURE_TABLE_SESSIONS'
          value: tableNames.sessions
        }
        {
          name: 'AZURE_TABLE_PROGRESS'
          value: tableNames.progress
        }
        {
          name: 'AZURE_TABLE_LEADERBOARD'
          value: tableNames.leaderboard
        }
      ]
    }
  }
}

resource ftpPolicy 'Microsoft.Web/sites/basicPublishingCredentialsPolicies@2025-03-01' = {
  parent: app
  name: 'ftp'
  properties: {
    allow: false
  }
}

resource scmPolicy 'Microsoft.Web/sites/basicPublishingCredentialsPolicies@2025-03-01' = {
  parent: app
  name: 'scm'
  properties: {
    allow: false
  }
}

output webAppName string = app.name
output webAppUrl string = 'https://${app.properties.defaultHostName}'
output principalId string = app.identity.principalId
