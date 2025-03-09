interface RegionMapping {
  [key: string]: string;
}

export const azureRegions: RegionMapping = {
  "australiacentral": "Australia Central",
  "australiacentral2": "Australia Central 2",
  "australiaeast": "Australia East",
  "australiasoutheast": "Australia Southeast",
  "brazilsouth": "Brazil South",
  "brazilsoutheast": "Brazil Southeast",
  "brazilus": "Brazil US",
  "canadacentral": "Canada Central",
  "canadaeast": "Canada East",
  "centralindia": "Central India",
  "centralus": "Central US",
  "centraluseuap": "Central US EUAP",
  "eastasia": "East Asia",
  "eastus": "East US",
  "eastus2": "East US 2",
  "eastus2euap": "East US 2 EUAP",
  "eastusstg": "East US STG",
  "francecentral": "France Central",
  "francesouth": "France South",
  "germanynorth": "Germany North",
  "germanywestcentral": "Germany West Central",
  "israelcentral": "Israel Central",
  "italynorth": "Italy North",
  "japaneast": "Japan East",
  "japanwest": "Japan West",
  "jioindiacentral": "Jio India Central",
  "jioindiawest": "Jio India West",
  "koreacentral": "Korea Central",
  "koreasouth": "Korea South",
  "mexicocentral": "Mexico Central",
  "newzealandnorth": "New Zealand North",
  "northcentralus": "North Central US",
  "northeurope": "North Europe",
  "norwayeast": "Norway East",
  "norwaywest": "Norway West",
  "polandcentral": "Poland Central",
  "qatarcentral": "Qatar Central",
  "southafricanorth": "South Africa North",
  "southafricawest": "South Africa West",
  "southcentralus": "South Central US",
  "southcentralusstg": "South Central US STG",
  "southindia": "South India",
  "southeastasia": "Southeast Asia",
  "spaincentral": "Spain Central",
  "swedencentral": "Sweden Central",
  "swedensouth": "Sweden South",
  "switzerlandnorth": "Switzerland North",
  "switzerlandwest": "Switzerland West",
  "uaecentral": "UAE Central",
  "uaenorth": "UAE North",
  "uksouth": "UK South",
  "ukwest": "UK West",
  "westcentralus": "West Central US",
  "westeurope": "West Europe",
  "westindia": "West India",
  "westus": "West US",
  "westus2": "West US 2",
  "westus3": "West US 3"
};

export function getRegionDisplayName(armRegionName: string | undefined): string {
  if (!armRegionName) return 'Unknown Region';
  return azureRegions[armRegionName.toLowerCase()] || armRegionName;
}

export function getArmRegionName(displayName: string): string | undefined {
  const normalizedDisplayName = displayName.toLowerCase();
  return Object.entries(azureRegions).find(
    ([_, value]) => value.toLowerCase() === normalizedDisplayName
  )?.[0];
}