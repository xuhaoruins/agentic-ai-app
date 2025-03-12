'use client';

import Link from 'next/link';
import { useSidebar } from '@/components/SidebarContext';

export default function Home() {
  const { isExpanded } = useSidebar();
  
  return (
    <main className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${
      isExpanded ? 'ml-64' : 'ml-16'
    } transition-all duration-300`}>
      <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-700 sm:text-6xl">
            Agentic AI Apps
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Choose an AI agent to help you with different Azure-related tasks
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12 max-w-6xl mx-auto">
          {/* Function Agent Card */}
          <Link href="/function-agent" className="group">
            <div className="relative overflow-hidden rounded-2xl border-3 border-blue-300 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-blue-400">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
              <div className="relative">
                <h2 className="text-2xl font-bold text-gray-900">Function Agent</h2>
                <p className="mt-4 text-gray-600">
                  Get accurate Azure pricing information using natural language queries. 
                  Perfect for cost estimation and budget planning.
                </p>
              </div>
            </div>
          </Link>

          {/* Instruct Agent Card */}
          <Link href="/instruct-agent" className="group">
            <div className="relative overflow-hidden rounded-2xl border-3 border-indigo-300 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-indigo-400">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-purple-600/5"></div>
              <div className="relative">
                <h2 className="text-2xl font-bold text-gray-900">Instruct Agent</h2>
                <p className="mt-4 text-gray-600">
                  Get assistance with documentation, code, text processing, and more 
                  through a versatile AI chat interface.
                </p>
              </div>
            </div>
          </Link>

          {/* Workflow Agent Card */}
          <Link href="/workflow-agent" className="group">
            <div className="relative overflow-hidden rounded-2xl border-3 border-purple-300 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-purple-400">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5"></div>
              <div className="relative">
                <h2 className="text-2xl font-bold text-gray-900">Workflow Agent</h2>
                <p className="mt-4 text-gray-600">
                  Experience a multi-step AI workflow with specialized agents for research, 
                  writing, and review working together on complex tasks.
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-16 text-center">
          <a 
            href="https://github.com/xuhaoruins/azurepricesearch"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View on GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
