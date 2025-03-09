'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Azure AI Agents',
  description: 'AI-powered agents for Azure cloud services',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };
  
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <div className="flex">
          <Sidebar isExpanded={isSidebarExpanded} toggleSidebar={toggleSidebar} />
          <div 
            className="flex-1 transition-all duration-300"
            style={{ 
              marginLeft: isSidebarExpanded ? '224px' : '64px' // 56px/16px sidebar width + buffer
            }}
          >
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
