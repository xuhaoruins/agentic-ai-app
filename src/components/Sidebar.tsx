'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isExpanded, toggleSidebar }) => {
  const pathname = usePathname();
  
  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300 md:hidden ${
          isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleSidebar}
      />
      
      <div 
        className={`fixed top-0 left-0 h-full z-30 transition-width duration-300 bg-white border-r border-gray-200 shadow-sm ${
          isExpanded ? 'w-64' : 'w-16'
        } overflow-y-auto`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          {isExpanded ? (
            <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Agentic AI
            </h1>
          ) : (
            <div className="w-full flex justify-center">
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                AI
              </span>
            </div>
          )}
          
          <button
            className="p-1 rounded text-gray-600 hover:bg-gray-100 focus:outline-none"
            onClick={toggleSidebar}
            aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isExpanded ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        <nav className="px-2 py-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className={`flex items-center rounded-lg py-2 px-4 ${
                  pathname === '/' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                } ${!isExpanded && 'justify-center px-2'}`}
              >
                <svg className={`w-5 h-5 ${isExpanded && 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {isExpanded && <span>Home</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/instruct-agent"
                className={`flex items-center rounded-lg py-2 px-4 ${
                  pathname === '/instruct-agent' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                } ${!isExpanded && 'justify-center px-2'}`}
              >
                <svg className={`w-5 h-5 ${isExpanded && 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                {isExpanded && <span>Instruct Agent</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/function-agent"
                className={`flex items-center rounded-lg py-2 px-4 ${
                  pathname === '/function-agent' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                } ${!isExpanded && 'justify-center px-2'}`}
              >
                <svg className={`w-5 h-5 ${isExpanded && 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                {isExpanded && <span>Function Agent</span>}
              </Link>
            </li>
            <li>
              <Link
                href="/workflow-agent"
                className={`flex items-center rounded-lg py-2 px-4 ${
                  pathname === '/workflow-agent' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100'
                } ${!isExpanded && 'justify-center px-2'}`}
              >
                <svg className={`w-5 h-5 ${isExpanded && 'mr-3'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                {isExpanded && <span>Workflow Agent</span>}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;