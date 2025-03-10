// This file contains the function tools for the function agent.
// add tool functions here when add new tool

import { PricingItem } from './function-agent-types';

// azure price api fetch function tool
export async function fetchAzurePrices(filter: string) {
    console.log('Fetching prices from Azure API');
    const api_url = "https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview";
    let allItems: PricingItem[] = [];
    
    // Make sure filter is URL encoded
    const encodedFilter = encodeURIComponent(filter);
    let nextPageUrl = `${api_url}&$filter=${encodedFilter}`;
    let pageCount = 0;
    const maxPages = 3; // Limit to 3 pages to avoid timeouts
  
    try {
      while (nextPageUrl && pageCount < maxPages) {
        console.log(`Fetching price data page ${pageCount + 1}...`);
        pageCount++;
        
        const response = await fetch(nextPageUrl, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          signal: AbortSignal.timeout(10000) // 10 seconds timeout
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            url: nextPageUrl,
            responseText: errorText.substring(0, 500)
          });
          throw new Error(`Failed to fetch prices: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        allItems = allItems.concat(data.Items || []);
        
        // Get next page or stop
        nextPageUrl = data.NextPageLink || '';
      }
      
      console.log(`Fetched a total of ${allItems.length} items in ${pageCount} pages`);
      return { Items: allItems };
    } catch (error) {
      console.error('Error fetching prices:', error);
      if (allItems.length > 0) {
        // If we have some items already, return them instead of failing completely
        console.log(`Returning ${allItems.length} items despite error`);
        return { Items: allItems };
      }
      throw error; // Re-throw if we have no items at all
    }
  }

