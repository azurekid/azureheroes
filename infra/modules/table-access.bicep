@description('Storage account created by the storage module.')
param storageAccountName string

@description('Only these four tables receive runtime data-plane role assignments.')
param tableNames object

@description('App Service system-assigned managed identity object ID, not an app/client ID.')
param principalId string

var tableContributorRoleId = subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3')

resource account 'Microsoft.Storage/storageAccounts@2026-09-01' existing = {
  name: storageAccountName
}

resource service 'Microsoft.Storage/storageAccounts/tableServices@2026-09-01' existing = {
  parent: account
  name: 'default'
}

resource tables 'Microsoft.Storage/storageAccounts/tableServices/tables@2026-09-01' existing = [for table in items(tableNames): {
  parent: service
  name: table.value
}]

resource access 'Microsoft.Authorization/roleAssignments@2022-04-01' = [for (table, i) in items(tableNames): {
  name: guid(tables[i].id, principalId, tableContributorRoleId)
  scope: tables[i]
  properties: {
    roleDefinitionId: tableContributorRoleId
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}]
