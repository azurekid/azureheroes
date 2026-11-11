targetScope = 'resourceGroup'

@description('Azure region for the new resources. Confirm Node 22, Basic App Service and the storage SKU are available before deploying.')
param location string = resourceGroup().location

@description('Environment label used in deterministic resource names. Use a separate resource group for each environment.')
@allowed([
  'dev'
  'test'
  'prod'
])
param environmentName string = 'prod'

@description('LRS minimizes cost; ZRS adds zone resilience where supported. Neither replaces backups.')
@allowed([
  'Standard_LRS'
  'Standard_ZRS'
])
param storageSku string = 'Standard_LRS'

@description('Leave false until the OIDC application package, Table Storage permissions, and first-release checks are ready. Keep false during initial provisioning.')
param applicationEnabled bool = false

@description('Additional non-sensitive resource tags.')
param tags object = {}

var suffix = uniqueString(subscription().subscriptionId, resourceGroup().id, environmentName)
var resourceTags = union(tags, {
  application: 'azureheroes'
  environment: environmentName
})
var tableNames = {
  accounts: 'accounts'
  sessions: 'sessions'
  progress: 'progress'
  leaderboard: 'leaderboard'
}

module network './modules/network.bicep' = {
  name: 'network'
  params: {
    location: location
    nameSuffix: '${environmentName}-${suffix}'
    tags: resourceTags
  }
}

module storage './modules/storage.bicep' = {
  name: 'storage'
  params: {
    location: location
    storageAccountName: 'stah${environmentName}${suffix}'
    storageSku: storageSku
    privateEndpointSubnetId: network.outputs.privateEndpointSubnetId
    virtualNetworkId: network.outputs.virtualNetworkId
    tableNames: tableNames
    tags: resourceTags
  }
}

module web './modules/web.bicep' = {
  name: 'web'
  params: {
    location: location
    nameSuffix: '${environmentName}-${suffix}'
    integrationSubnetId: network.outputs.integrationSubnetId
    tableEndpoint: storage.outputs.tableEndpoint
    tableNames: tableNames
    applicationEnabled: applicationEnabled
    tags: resourceTags
  }
}

module tableAccess './modules/table-access.bicep' = {
  name: 'table-access'
  params: {
    storageAccountName: storage.outputs.storageAccountName
    tableNames: tableNames
    principalId: web.outputs.principalId
  }
}

output webAppName string = web.outputs.webAppName
output webAppUrl string = web.outputs.webAppUrl
output managedIdentityPrincipalId string = web.outputs.principalId
output storageAccountName string = storage.outputs.storageAccountName
output tableEndpoint string = storage.outputs.tableEndpoint
output tables object = tableNames
output applicationState string = applicationEnabled ? 'Enabled: verify application health and Table access' : 'Stopped: applicationEnabled is false'
