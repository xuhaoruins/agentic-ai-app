//this file defines the schema for the tools used in the function agent
// add tool schema here when add new tool


import { Tool } from './function-agent-types';
import { azureVmSize, azureRegions } from './azure-price-context';

/**
 * Available tools for the function agent
 */
export const availableTools: Tool[] = [
  //azure price query function call tools definition
  {
    id: 'azure_price_query',
    name: 'Azure Price Query',
    description: 'Query Azure retail prices using OData filter expressions',
    functionDefinition: {
      name: "azure_price_query",
      description: "Query Azure price data using OData filter expressions",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "OData query filter, e.g.: contains(armSkuName, 'Standard_D2_v3') and contains(armRegionName, 'eastus')"
          }
        },
        required: ["query"]
      }
    },
    enabled: true
  },
  // TAVILY web search function call definition
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Search content from internet by using the web search API',
    functionDefinition: {
      name: "web_search",
      description: "use internet web search to search content",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "query string to search, e.g.: 'What is the price of Standard_D2_v3 in eastus?'"
          }
        },
        required: ["query"]
      }
    },
    enabled: true
  },
];
