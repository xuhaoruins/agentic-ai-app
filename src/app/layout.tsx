import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import SidebarWrapper from '@/components/SidebarWrapper';
import { SidebarProvider } from '@/components/SidebarContext';

export const metadata: Metadata = {
  title: 'Agentic AI App',
  description: 'A Next.js app with various AI agents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />
      </head>
      <body className="bg-gray-50 min-h-screen">
        <SidebarProvider>
          <div className="flex min-h-screen">
            <SidebarWrapper />
            <main className="flex-1 transition-all duration-300 ease-in-out overflow-auto">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}
