'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface SidebarProps {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isExpanded, toggleSidebar }: SidebarProps) {
  return (
    <div 
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-blue-500 to-purple-600 text-white transition-all duration-300 z-10 shadow-lg`}
      style={{ width: isExpanded ? '224px' : '64px' }}
    >
      <div className="flex flex-col h-full">
        {/* Toggle button */}
        <button 
          className="p-3 self-end text-white hover:bg-white/10 rounded-md"
          onClick={toggleSidebar}
        >
          <span className="material-icons-outlined">
            {isExpanded ? 'chevron_left' : 'chevron_right'}
          </span>
        </button>
        
        {/* Sidebar content */}
        <div className={`flex flex-col overflow-hidden ${isExpanded ? 'items-start px-4' : 'items-center px-0'}`}>
          {/* Your sidebar navigation items */}
          <Link href="/" className="flex items-center py-3 px-2 rounded-md hover:bg-white/10 w-full">
            <span className="material-icons-outlined">home</span>
            {isExpanded && <span className="ml-2">Home</span>}
          </Link>
          
          <Link href="/instruct-agent" className="flex items-center py-3 px-2 rounded-md hover:bg-white/10 w-full">
            <span className="material-icons-outlined">chat</span>
            {isExpanded && <span className="ml-2">Instruct Agent</span>}
          </Link>

          <Link href="/function-agent" className="flex items-center py-3 px-2 rounded-md hover:bg-white/10 w-full">
            <span className="material-icons-outlined">functions</span>
            {isExpanded && <span className="ml-2">Function Agent</span>}
          </Link>
          

        </div>
      </div>
    </div>
  );
}