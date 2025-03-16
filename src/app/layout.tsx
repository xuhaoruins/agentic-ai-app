import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import "@copilotkit/react-ui/styles.css";
import SidebarWrapper from '@/components/SidebarWrapper';
import { SidebarProvider } from '@/components/SidebarContext';
import { CopilotKit } from "@copilotkit/react-core";

export const metadata: Metadata = {
  title: 'Open MCP Client',
  description: 'An open source MCP client built with CopilotKit 🪁',
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
      <body className="bg-gray-50 min-h-screen font-sans antialiased">
        <CopilotKit
          runtimeUrl="/api/copilotkit"
          agent="sample_agent"
          showDevConsole={false}
        >
          <SidebarProvider>
            <div className="flex min-h-screen">
              <SidebarWrapper />
              <main className="flex-1 transition-all duration-300 ease-in-out overflow-auto">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </CopilotKit>
      </body>
    </html>
  )
}
