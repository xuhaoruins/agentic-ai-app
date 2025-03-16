'use client';

import { useState, useEffect } from 'react';
import { PricingItem, ToolSelection } from '@/lib/function-agent/function-agent-types';
import ChatInterface from '@/components/function-agent/ChatInterface';
import Results from '@/components/function-agent/Results';
import ToolsBox from '@/components/function-agent/ToolsBox';
import { availableTools } from '@/lib/function-agent/tools-schema';
import Image from 'next/image';
import { useSidebar } from '@/components/SidebarContext';

// Define a type that can handle different result types
type ResultItem = PricingItem | {
  title: string;
  url: string;
  snippet: string;
  datePublished?: string;
};

// Import or define the ResultsData type to match ChatInterface expectations
interface ResultsData {
  items: Record<string, unknown>[];
  filter: string;
  resultType?: string;
  _aiResponse?: string;
}

export default function FunctionAgentPage() {
  const { isExpanded } = useSidebar();
  const [results, setResults] = useState<ResultItem[]>([]);
  const [resultType, setResultType] = useState<string>('price');
  // Using underscore prefix to indicate intentionally unused state variable
  const [_filter, setFilter] = useState(''); 
  const [chatHeight, setChatHeight] = useState('450px');
  const [selectedTools, setSelectedTools] = useState<ToolSelection>({
    toolIds: availableTools.filter(t => t.enabled).map(t => t.id)
  });

  useEffect(() => {
    const updateChatHeight = () => {
      const vh = window.innerHeight;
      const headerHeight = 80;
      const bottomMargin = 20;
      const availableHeight = vh - headerHeight - bottomMargin;
      
      const minHeight = 320;
      const maxHeight = 800; 
      const calculatedHeight = Math.max(minHeight, Math.min(maxHeight, availableHeight * 0.85));
      
      setChatHeight(`${calculatedHeight}px`);
    };

    updateChatHeight();
    window.addEventListener('resize', updateChatHeight);
    return () => window.removeEventListener('resize', updateChatHeight);
  }, []);

  const handleResults = (data: ResultsData) => {
    const { items, filter, resultType = 'price', _aiResponse } = data;
    // Cast the items to the expected ResultItem[] type
    setResults(items as unknown as ResultItem[]);
    setFilter(filter);
    setResultType(resultType);
    // Log filter to console instead of displaying it
    console.log(`Query Filter for ${resultType}:`, filter);
  };

  const handleToolSelectionChange = (selection: ToolSelection) => {
    console.log('Tool selection changed:', selection);
    setSelectedTools(selection);
  };

  /**
   * Function reserved for future implementation to clear results
   * @remarks Currently not used but kept for future functionality
   */
  const _handleClearResults = () => {
    setResults([]);
    setFilter('');
  };

  return (
    <main className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-3 px-4 md:py-4 ${
      isExpanded ? 'ml-64' : 'ml-16'
    } transition-all duration-300`}>
      <div className="w-full mx-auto">
        <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 z-0"></div>
          
          <div className="relative z-10 p-3 md:p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1">
                  <div className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 p-0.5 z-10">
                    <div className="bg-white rounded-full p-1">
                      <Image src="/globe.svg" alt="Azure" width={18} height={18} className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="rounded-full bg-gradient-to-r from-purple-500 to-blue-600 p-0.5 z-0">
                    <div className="bg-white rounded-full p-1">
                      <Image src="/window.svg" alt="Azure" width={18} height={18} className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-700">
                  Function Agent
                </h1>
              </div>
              
              <div className="flex items-center text-xs gap-3">
                <a href="https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview" 
                   className="flex items-center hover:text-blue-600 transition-colors" 
                   target="_blank" 
                   rel="noopener noreferrer">
                  <svg className="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                  API
                </a>
                
                <a href="https://github.com/xuhaoruins/azurepricesearch" 
                   className="flex items-center hover:text-blue-600 transition-colors"
                   target="_blank" 
                   rel="noopener noreferrer">
                  <svg className="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                  GitHub
                </a>
              </div>
            </div>

            <div className="flex flex-row gap-4">
              {/* Chat Interface */}
              <div 
                style={{ height: chatHeight }} 
                className="w-3/4 rounded-xl overflow-hidden border border-gray-200 shadow-lg transition-all"
              >
                <ChatInterface onResults={handleResults} selectedTools={selectedTools} />
              </div>
              
              {/* Tools Box */}
              <div 
                style={{ height: chatHeight }}
                className="w-1/4 rounded-xl overflow-hidden transition-all"
              >
                <ToolsBox tools={availableTools} onToolSelectionChange={handleToolSelectionChange} />
              </div>
            </div>
          </div>
        </div>
        
        <div id="results" className={`transition-opacity duration-300 ${results.length > 0 ? 'opacity-100' : 'opacity-0'}`}>
          {results.length > 0 && <Results items={results} resultType={resultType} />}
        </div>
      </div>
    </main>
  );
}