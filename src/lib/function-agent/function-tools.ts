// This file contains the function tools for the function agent.
// add tool functions here when add new tool

import { PricingItem } from './function-agent-types';
// Import the Tavily client
import { tavily } from "@tavily/core";

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

// TAVILY web search function tool - simplified with official SDK
export async function WebSearch(query: string) {
    console.log('Fetching web search results for query:', query);
    const apiKey = process.env.TAVILY_API_KEY;
    
    if (!apiKey) {
        console.error('TAVILY_API_KEY is not set in environment variables');
        return { 
            Items: convertToCompatibleFormat(generateMockSearchResults(query)),
            filter: query 
        };
    }
    
    try {
        // Use the official Tavily SDK
        const client = tavily({ apiKey });
        const searchResponse = await client.search(query, {
            search_depth: "basic",
            max_results: 10
        });
        
        console.log(`Web search results count: ${searchResponse?.results?.length || 0}`);
        
        // If we have results, format and return them
        if (searchResponse?.results && searchResponse.results.length > 0) {
            return {
                Items: convertToCompatibleFormat(searchResponse.results),
                filter: query
            };
        }
        
        // Fallback when no results are found
        console.log('No search results found, providing fallback response');
        return {
            Items: convertToCompatibleFormat(generateMockSearchResults(query)),
            filter: query
        };
    } catch (error) {
        console.error('Error in web search:', error);
        return { 
            Items: convertToCompatibleFormat(generateMockSearchResults(query)),
            filter: query 
        };
    }
}

// Helper function to generate mock search results when API fails
function generateMockSearchResults(query: string) {
    // Clean up query
    const cleanQuery = query.trim();
    
    // Check for Chinese characters in query
    const hasChinese = /[\u3400-\u9FBF]/.test(cleanQuery);
    
    if (hasChinese) {
        return [{
            title: `关于 "${cleanQuery}" 的搜索结果`,
            content: `您搜索的是 "${cleanQuery}"。由于搜索API暂时不可用，我们无法提供实时网络搜索结果。但我可以尝试回答您的问题。`,
            url: 'https://www.google.com/search?q=' + encodeURIComponent(cleanQuery),
            snippet: '这是一个模拟的搜索结果。实际搜索API目前无法连接。我们将尽快修复此问题。'
        }];
    }
    
    return [{
        title: `Search results for: "${cleanQuery}"`,
        content: `You searched for "${cleanQuery}". The search API is currently unavailable, but I can still try to answer your question based on my knowledge.`,
        url: 'https://www.google.com/search?q=' + encodeURIComponent(cleanQuery),
        snippet: 'This is a simulated search result. The actual search API is currently unavailable. We\'re working to fix this issue.'
    }];
}

// Helper function to convert search results to PricingItem format
function convertToCompatibleFormat(searchResults: Array<{
  title?: string;
  content?: string;
  url?: string;
  snippet?: string;
}>): PricingItem[] {
    return searchResults.map(result => {
        return {
            // Required PricingItem fields
            armSkuName: result.title || "Search Result",
            retailPrice: 0,
            unitOfMeasure: "N/A",
            armRegionName: "Global",
            productName: "WebSearch",
            skuName: "SearchResult",
            serviceFamily: "AI",
            type: "WebSearch", // Add the missing required 'type' property
            
            // Preserve original search result data
            meterName: result.snippet || result.content || "Search result",
            serviceId: "WebSearch",
            serviceName: "WebSearch",
            
            // Add search result specific fields as custom properties
            title: result.title || "",
            content: result.content || result.snippet || "",
            url: result.url || "",
            snippet: result.snippet || result.content || "",
        } as PricingItem;
    });
}


