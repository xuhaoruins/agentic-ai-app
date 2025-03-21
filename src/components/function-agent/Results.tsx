'use client';

import { PricingItem } from '@/lib/function-agent/function-agent-types';
import { getRegionDisplayName } from '@/lib/function-agent/azure-price-context';
import { useState, useMemo } from 'react';

type SortField = 'price' | 'product' | 'sku' | 'region' | 'title' | '';
type SortDirection = 'asc' | 'desc';

interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  datePublished?: string;
}

// Generic result item type that could be either price data or web search result
type ResultItem = PricingItem | WebSearchResult;

export default function Results({ 
  items, 
  resultType = 'price' 
}: { 
  items: ResultItem[]; 
  resultType?: 'price' | 'web_search' | string;
}) {
  const [sortField, setSortField] = useState<SortField>(resultType === 'price' ? 'price' : 'title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // Function to check if an item is a pricing item
  const isPricingItem = (item: ResultItem): item is PricingItem => {
    return 'retailPrice' in item && 'armSkuName' in item;
  };

  // Function to check if an item is a web search result
  const isWebSearchResult = (item: ResultItem): item is WebSearchResult => {
    return 'title' in item && 'url' in item && 'snippet' in item;
  };

  // Function to truncate text to approximately 3 lines
  const truncateSnippet = (text: string): string => {
    // Approximate characters for 3 lines (assuming ~70 chars per line)
    const maxLength = 200;
    
    if (text.length <= maxLength) return text;
    
    // Find a good breakpoint near maxLength
    let breakpoint = text.lastIndexOf('. ', maxLength);
    if (breakpoint === -1 || breakpoint < maxLength * 0.5) {
      breakpoint = text.lastIndexOf(' ', maxLength);
    }
    
    return breakpoint !== -1 
      ? `${text.substring(0, breakpoint + 1)}...` 
      : `${text.substring(0, maxLength)}...`;
  };

  // Sort and filter items
  const sortedAndFilteredItems = useMemo(() => {
    if (!items.length) return [];
    
    let filteredItems = items;
    
    // Apply search filter if any
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase().trim();
      
      if (resultType === 'price') {
        filteredItems = items.filter(item => {
          if (!isPricingItem(item)) return false;
          
          return (
            item.armSkuName?.toLowerCase().includes(lowerSearchTerm) || 
            item.productName?.toLowerCase().includes(lowerSearchTerm) ||
            item.armRegionName?.toLowerCase().includes(lowerSearchTerm) ||
            getRegionDisplayName(item.armRegionName)?.toLowerCase().includes(lowerSearchTerm)
          );
        });
      } else if (resultType === 'web_search') {
        filteredItems = items.filter(item => {
          if (!isWebSearchResult(item)) return false;
          
          return (
            item.title.toLowerCase().includes(lowerSearchTerm) ||
            item.snippet.toLowerCase().includes(lowerSearchTerm) ||
            item.url.toLowerCase().includes(lowerSearchTerm)
          );
        });
      }
    }
    
    // Apply sorting
    return [...filteredItems].sort((a, b) => {
      if (resultType === 'price' && isPricingItem(a) && isPricingItem(b)) {
        if (sortField === 'price') {
          const priceA = typeof a.retailPrice === 'number' ? a.retailPrice : 0;
          const priceB = typeof b.retailPrice === 'number' ? b.retailPrice : 0;
          return sortDirection === 'asc' ? priceA - priceB : priceB - priceA;
        } else if (sortField === 'product') {
          return sortDirection === 'asc' 
            ? (a.productName || '').localeCompare(b.productName || '')
            : (b.productName || '').localeCompare(a.productName || '');
        } else if (sortField === 'sku') {
          return sortDirection === 'asc' 
            ? (a.armSkuName || '').localeCompare(b.armSkuName || '')
            : (b.armSkuName || '').localeCompare(a.armSkuName || '');
        } else if (sortField === 'region') {
          const regionA = getRegionDisplayName(a.armRegionName);
          const regionB = getRegionDisplayName(b.armRegionName);
          return sortDirection === 'asc' 
            ? (regionA || '').localeCompare(regionB || '')
            : (regionB || '').localeCompare(regionA || '');
        }
      } else if (resultType === 'web_search' && isWebSearchResult(a) && isWebSearchResult(b)) {
        if (sortField === 'title') {
          return sortDirection === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        }
        // Could add sorting by date if available
      }
      return 0;
    });
  }, [items, sortField, sortDirection, searchTerm, resultType]);

  if (!items.length) return null;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sorting icon based on current state
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 inline-block ml-1">
        <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04l3.96 4.158V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 inline-block ml-1">
        <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden my-6 border border-gray-200">
      <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            {resultType === 'price' ? 'Azure Price Results' : resultType === 'web_search' ? 'Web Search Results' : 'Results'}
            <span className="ml-2 text-sm font-medium px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
              {sortedAndFilteredItems.length} {resultType === 'web_search' ? 'items' : 'records'}
            </span>
          </h2>
          
          {/* Add clear results button */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter results..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 w-full md:w-64"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {resultType === 'price' && (
          <table className="min-w-full divide-y divide-gray-400 border-collapse border border-gray-400">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-black/40">
                <th 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200/50 transition-colors border-r border-black/30"
                  onClick={() => handleSort('sku')}
                >
                  SKU {getSortIcon('sku')}
                </th>
                <th 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-24 cursor-pointer hover:bg-gray-200/50 transition-colors border-r border-black/30"
                  onClick={() => handleSort('price')}
                >
                  Price {getSortIcon('price')}
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-20 border-r border-black/30">
                  Unit
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-24 max-w-[180px] border-r border-black/30">
                  Meter
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-24 border-r border-black/30">
                  Term
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r border-black/30">
                  Savings Plan
                </th>
                <th 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-36 max-w-xs cursor-pointer hover:bg-gray-200/50 transition-colors border-r border-black/30"
                  onClick={() => handleSort('product')}
                >
                  Product {getSortIcon('product')}
                </th>
                <th 
                  className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider w-32 cursor-pointer hover:bg-gray-200/50 transition-colors"
                  onClick={() => handleSort('region')}
                >
                  Region {getSortIcon('region')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-black/20">
              {sortedAndFilteredItems.map((item, index) => {
                if (!isPricingItem(item)) return null;
                return (
                  <tr 
                    key={index} 
                    className={`${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    } hover:bg-blue-50 transition-colors border-b border-black/20`}
                  >
                    <td className="px-3 py-2.5 text-sm font-medium text-blue-600 border-r border-black/20" title={item.armSkuName}>
                      <div className="break-words max-w-[150px]">
                        {item.armSkuName}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900 border-r border-black/20">
                      ${typeof item.retailPrice === 'number' ? item.retailPrice.toFixed(4) : item.retailPrice}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-500 border-r border-black/20" title={item.unitOfMeasure}>
                      <div className="break-words max-w-[80px]">
                        {item.unitOfMeasure}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900 border-r border-black/20" title={item.meterName}>
                      <div className="break-words max-w-[150px]">
                        {item.meterName}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900 border-r border-black/20" title={item.reservationTerm || '-'}>
                      <div className="break-words max-w-[80px]">
                        {item.reservationTerm || '-'}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900 border-r border-black/20">
                      {item.savingsPlan && Array.isArray(item.savingsPlan) && item.savingsPlan.length > 0 ? (
                        <div className="flex flex-col space-y-1">
                          {item.savingsPlan.map((plan: { term: string, retailPrice: string }, idx: number) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium">{plan.term}:</span> ${plan.retailPrice}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900 border-r border-black/20" title={item.productName}>
                      <div className="break-words max-w-[150px]">
                        {item.productName}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-900" title={getRegionDisplayName(item.armRegionName)}>
                      <div className="break-words max-w-[120px]">
                        {getRegionDisplayName(item.armRegionName)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {resultType === 'web_search' && (
          <div className="divide-y divide-gray-200">
            {sortedAndFilteredItems.map((item, index) => {
              if (!isWebSearchResult(item)) return null;
              return (
                <div key={index} className="p-6 hover:bg-blue-50 transition-colors">
                  <div className="flex flex-col">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-800 text-xl font-semibold mb-2"
                    >
                      {item.title}
                    </a>
                    <div className="text-green-700 text-sm mb-3 truncate">
                      {item.url}
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed line-clamp-3">
                      {truncateSnippet(item.snippet)}
                    </p>
                    {item.datePublished && (
                      <div className="text-xs text-gray-500 mt-3">
                        Published: {new Date(item.datePublished).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {sortedAndFilteredItems.length === 0 && (
          <div className="p-8 text-center text-gray-500 italic">
            No matching records found. Try adjusting your filter.
          </div>
        )}
      </div>
      
      {sortedAndFilteredItems.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 text-right flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {searchTerm && sortedAndFilteredItems.length !== items.length ? 
              `Filtered: ${sortedAndFilteredItems.length} of ${items.length} records` : 
              `Showing all ${items.length} records`}
          </div>
          <div>
            <button 
              onClick={() => setSearchTerm('')} 
              className={`text-sm px-3 py-1 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition-colors ${!searchTerm ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!searchTerm}
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
