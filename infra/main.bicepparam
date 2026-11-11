using './main.bicep'

// Example only. Review regional availability, policy, cost and names in what-if.
param location = 'eastus'
param environmentName = 'prod'
param storageSku = 'Standard_LRS'
param applicationEnabled = true
param tags = {
  project: 'azureheroes'
}
