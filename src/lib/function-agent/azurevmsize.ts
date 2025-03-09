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
