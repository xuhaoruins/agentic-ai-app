"use client";

import { CopilotChat } from "@copilotkit/react-ui";
import { CopilotActionHandler } from "@/components/mcp-agent/CopilotActionHandler";
import { MCPConfigForm } from "@/components/mcp-agent/MCPConfigForm";
import { useState } from "react";
import { useSidebar } from "@/components/SidebarContext";

export default function Home() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isExpanded } = useSidebar();

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${
      isExpanded ? 'ml-64' : 'ml-16'
    } transition-all duration-300`}>
      {/* Client component that sets up the Copilot action handler */}
      <CopilotActionHandler />

      <div className="flex flex-1 relative">
        {/* Main content area */}
        <div className="flex-1 p-4 md:p-8 pr-4 overflow-y-auto lg:pr-[32vw]">
          <MCPConfigForm />
        </div>

        {/* Chat sidebar - hidden on mobile, shown on larger screens */}
        <div
          className={`fixed top-0 right-0 h-full w-full md:w-[80vw] lg:w-[30vw] border-l border-gray-200 bg-white shadow-md transition-transform duration-300 z-40 ${
            isChatOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="h-full flex flex-col">
            {/* Only on mobile: header with close button */}
            <div className="lg:hidden flex items-center justify-between p-3 border-b">
              <h3 className="font-medium">MCP Assistant</h3>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Copilot Chat takes the full height */}
            <div className="flex-1 h-full">
              <CopilotChat
                className="h-full"
                instructions="You are assisting the user with MCP (Multi-platform Capability Provider) configuration and connection. Help the user understand how to set up and use MCP servers, how to connect to them, and how to troubleshoot common issues."
                labels={{
                  title: "MCP Assistant",
                  initial: "Need help setting up your MCP connections? I can help you configure local servers or connect to remote endpoints.",
                  placeholder: "Ask about MCP configuration..."
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile chat toggle button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-gray-800 text-white rounded-full shadow-lg lg:hidden hover:bg-gray-700"
        aria-label="Toggle chat"
      >
        {isChatOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
