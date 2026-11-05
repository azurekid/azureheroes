using './main.bicep'

// Example only. Review regional availability, policy, cost and names in what-if.
param location = 'westeurope'
param environmentName = 'prod'
param storageSku = 'Standard_LRS'
param applicationEnabled = false
param tags = {
  project: 'azureheroes'
}
