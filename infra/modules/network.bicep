@description('Region shared by the app, plan, VNet and private endpoint.')
param location string

@description('Environment and deterministic uniqueness suffix supplied by the entry template.')
param nameSuffix string

@description('Non-sensitive resource tags.')
param tags object

resource nsg 'Microsoft.Network/networkSecurityGroups@2026-03-01' = {
  name: 'nsg-azureheroes-${nameSuffix}'
  location: location
  tags: tags
  properties: {
    securityRules: [
      {
        name: 'AllowAppToTableHttps'
        properties: {
          priority: 100
          direction: 'Inbound'
          access: 'Allow'
          protocol: 'Tcp'
          sourceAddressPrefix: '10.77.0.0/26'
          sourcePortRange: '*'
          destinationAddressPrefix: '10.77.0.64/27'
          destinationPortRange: '443'
        }
      }
      {
        name: 'DenyOtherInbound'
        properties: {
          priority: 200
          direction: 'Inbound'
          access: 'Deny'
          protocol: '*'
          sourceAddressPrefix: '*'
          sourcePortRange: '*'
          destinationAddressPrefix: '*'
          destinationPortRange: '*'
        }
      }
    ]
  }
}

resource vnet 'Microsoft.Network/virtualNetworks@2026-03-01' = {
  name: 'vnet-azureheroes-${nameSuffix}'
  location: location
  tags: tags
  properties: {
    addressSpace: {
      addressPrefixes: [
        '10.77.0.0/24'
      ]
    }
    subnets: [
      {
        name: 'app-integration'
        properties: {
          addressPrefix: '10.77.0.0/26'
          networkSecurityGroup: {
            id: nsg.id
          }
          delegations: [
            {
              name: 'app-service'
              properties: {
                serviceName: 'Microsoft.Web/serverFarms'
              }
            }
          ]
        }
      }
      {
        name: 'private-endpoints'
        properties: {
          addressPrefix: '10.77.0.64/27'
          networkSecurityGroup: {
            id: nsg.id
          }
          privateEndpointNetworkPolicies: 'Enabled'
        }
      }
    ]
  }
}

output virtualNetworkId string = vnet.id
output integrationSubnetId string = '${vnet.id}/subnets/app-integration'
output privateEndpointSubnetId string = '${vnet.id}/subnets/private-endpoints'
