// This file contains the context for the Azure Price tool, including VM sizes, regions, and prompts.

export const azureVmSize = [
  {
      "VM_Type": "General Purpose",
      "Series_Family": "A-family",
      "Purpose": "Entry-level economical workloads",
      "Description": "Balanced CPU-to-memory ratio, suitable for testing, development, small to medium databases, low to medium traffic web servers",
      "armSkuName_Example": "Standard_A1_v2",
      "Keywords": "economical, entry-level, balanced"
    },
    {
      "VM_Type": "General Purpose",
      "Series_Family": "B-family",
      "Purpose": "Burstable workloads",
      "Description": "CPU credit model for variable workloads, ideal for web servers, proof of concepts, small databases, development environments",
      "armSkuName_Example": "Standard_B1s",
      "Keywords": "burstable, credits, variable performance"
    },
    {
      "VM_Type": "General Purpose",
      "Series_Family": "D-family",
      "Purpose": "Enterprise-grade applications, relational databases, in-memory caching, data analytics",
      "Description": "High CPU-to-memory ratio, faster processors, more memory per core",
      "armSkuName_Example": "Standard_D2_v5",
      "Keywords": "enterprise, relational databases, in-memory caching"
    },
    {
      "VM_Type": "General Purpose",
      "Series_Family": "DC-family",
      "Purpose": "Confidential computing with data protection and integrity",
      "Description": "Enhanced security features, hardware-based Trusted Execution Environments (TEEs)",
      "armSkuName_Example": "Standard_DC2s_v3",
      "Keywords": "confidential, security, TEE"
    },
    {
      "VM_Type": "Compute Optimized",
      "Series_Family": "F-family",
      "Purpose": "Medium traffic web servers, network appliances, batch processes, application servers",
      "Description": "High CPU-to-memory ratio, powerful processors for compute-intensive tasks",
      "armSkuName_Example": "Standard_F2s_v2",
      "Keywords": "compute-intensive, high CPU, batch processing"
    },
    {
      "VM_Type": "Compute Optimized",
      "Series_Family": "FX-family",
      "Purpose": "Electronic Design Automation (EDA), large memory relational databases, medium to large caches, in-memory analytics",
      "Description": "High frequency CPUs, large cache per core, exceptional computational power",
      "armSkuName_Example": "Standard_FX4mds",
      "Keywords": "EDA, large memory, high frequency"
    },
    {
      "VM_Type": "Memory Optimized",
      "Series_Family": "E-family",
      "Purpose": "Relational databases, medium to large caches, in-memory analytics",
      "Description": "High memory-to-core ratio, supports memory-intensive workloads",
      "armSkuName_Example": "Standard_E2_v5",
      "Keywords": "memory-intensive, high memory, caches"
    },
    {
      "VM_Type": "Memory Optimized",
      "Series_Family": "Eb-family",
      "Purpose": "High remote storage performance for memory-intensive workloads",
      "Description": "Similar to E-family but with enhanced storage capabilities",
      "armSkuName_Example": "Standard_Eb4s_v5",
      "Keywords": "remote storage, high performance, memory-intensive"
    },
    {
      "VM_Type": "Memory Optimized",
      "Series_Family": "EC-family",
      "Purpose": "Confidential computing for memory-intensive workloads",
      "Description": "Security features combined with high memory capacities",
      "armSkuName_Example": "Standard_EC2s_v5",
      "Keywords": "confidential, memory-intensive, security"
    },
    {
      "VM_Type": "Memory Optimized",
      "Series_Family": "M-family",
      "Purpose": "Extremely large databases, large amounts of memory",
      "Description": "Ultra-high memory capacities, high vCPU capabilities",
      "armSkuName_Example": "Standard_M128ms",
      "Keywords": "ultra-high memory, large databases, high vCPU"
    },
    {
      "VM_Type": "Storage Optimized",
      "Series_Family": "L-family",
      "Purpose": "High disk throughput and I/O, big data, SQL and NoSQL databases, data warehousing, large transactional databases",
      "Description": "High disk throughput, large local disk storage capacities",
      "armSkuName_Example": "Standard_L8s_v3",
      "Keywords": "storage-intensive, high throughput, big data"
    },
    {
      "VM_Type": "GPU Accelerated",
      "Series_Family": "NC-family",
      "Purpose": "Compute-intensive, graphics-intensive, visualization",
      "Description": "Equipped with NVIDIA GPUs for acceleration",
      "armSkuName_Example": "Standard_NC6",
      "Keywords": "GPU, NVIDIA, visualization"
    },
    {
      "VM_Type": "GPU Accelerated",
      "Series_Family": "ND-family",
      "Purpose": "Large memory compute-intensive, large memory graphics-intensive, large memory visualization",
      "Description": "Specialized for deep learning and AI with powerful GPUs",
      "armSkuName_Example": "Standard_ND40rs_v2",
      "Keywords": "deep learning, AI, large memory"
    },
    {
      "VM_Type": "GPU Accelerated",
      "Series_Family": "NG-family",
      "Purpose": "Virtual Desktop (VDI), cloud gaming",
      "Description": "Optimized for graphics and streaming with AMD Radeon™ PRO GPUs",
      "armSkuName_Example": "Standard_NG32ads_V620_v1",
      "Keywords": "gaming, VDI, AMD Radeon"
    },
    {
      "VM_Type": "GPU Accelerated",
      "Series_Family": "NV-family",
      "Purpose": "Virtual desktop (VDI), single-precision compute, video encoding and rendering",
      "Description": "Designed for graphics-intensive applications with NVIDIA or AMD GPUs",
      "armSkuName_Example": "Standard_NV6",
      "Keywords": "graphics, rendering, NVIDIA"
    },
    {
      "VM_Type": "FPGA Accelerated",
      "Series_Family": "NP-family",
      "Purpose": "Machine learning inference, video transcoding, database search and analytics",
      "Description": "Equipped with FPGAs for custom hardware acceleration",
      "armSkuName_Example": "Standard_NP10s",
      "Keywords": "FPGA, inference, transcoding"
    },
    {
      "VM_Type": "High Performance Compute",
      "Series_Family": "HB-family",
      "Purpose": "High memory bandwidth, fluid dynamics, weather modeling",
      "Description": "High-performance CPUs and fast memory for compute-intensive workloads",
      "armSkuName_Example": "Standard_HB120rs_v2",
      "Keywords": "HPC, high bandwidth, weather modeling"
    },
    {
      "VM_Type": "High Performance Compute",
      "Series_Family": "HC-family",
      "Purpose": "High density compute, finite element analysis, molecular dynamics, computational chemistry",
      "Description": "Exceptional computational capabilities for intensive processing",
      "armSkuName_Example": "Standard_HC44rs",
      "Keywords": "finite element analysis, molecular dynamics, computational chemistry"
    },
    {
      "VM_Type": "High Performance Compute",
      "Series_Family": "HX-family",
      "Purpose": "Large memory capacity, Electronic Design Automation (EDA)",
      "Description": "High memory and CPU performance for memory-intensive HPC tasks",
      "armSkuName_Example": "Standard_HX176rs",
      "Keywords": "large memory, EDA, high performance"
    }
];

export const azureRegions: { [key: string]: string } = {
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

/**
 * System prompt for Azure price analysis to guide the model's response
 */
export const azurePriceAnalysisPrompt = `
You are Azure Price Agent, an expert in analyzing Azure pricing data.

You have received query results from Azure Price API. When analyzing this data:

1. Clearly summarize the pricing data for the requested Azure resources
2. Compare different options when relevant (region differences, VM series comparisons, etc.)
3. Highlight any special pricing features like reservation discounts or savings plans
4. Format prices consistently with proper currency symbols and decimal places
5. Provide context about what the prices mean (hourly rates, storage costs, etc.)
6. Format your response in well-structured markdown with appropriate headings and tables
7. Focus on the most relevant information from the price data

If minimal price data is available, explain why that might be and suggest improvements to the query.
`;


/**
 * Gets a human-readable display name for an Azure region code
 * @param regionCode The Azure region code (e.g., "eastus", "westeurope")
 * @returns The display name of the region or the original code if not found
 */
export function getRegionDisplayName(regionCode: string | null | undefined): string {
  if (!regionCode) return 'Global';
  
  const normalizedCode = regionCode.toLowerCase().trim();
  
  // Return the mapped region name or the original code if no mapping exists
  return azureRegions[normalizedCode] || regionCode;
}
