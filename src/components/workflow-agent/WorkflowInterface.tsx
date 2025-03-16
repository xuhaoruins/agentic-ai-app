'use client';
import React, { useState } from 'react';
import { WorkflowAgentEvent } from '@/lib/types';
import AgentLog from './AgentLog';

export default function WorkflowInterface() {
  const [userInput, setUserInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [events, setEvents] = useState<WorkflowAgentEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsSubmitting(true);
    setEvents([]);
    setError(null);

    try {
      // 更改 API 路径
      const response = await fetch('/api/workflow-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMsg: userInput })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Server responded with ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        
        // Process the SSE data
        const lines = text.split('\n\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.substring(6));
              if (eventData.type === 'error') {
                setError(eventData.data.error);
              } else {
                setEvents(prev => [...prev, eventData]);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Workflow Agent</h1>
      
      <div className="mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="userInput" className="block text-sm font-medium text-gray-700 mb-1">
              What would you like the workflow agent to work on?
            </label>
            <textarea
              id="userInput"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm min-h-[100px]"
              placeholder="Example: Write me a report on renewable energy sources and their impact on climate change."
              disabled={isSubmitting}
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting || userInput.trim() === ''}
            className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Processing...' : 'Start Workflow'}
          </button>
        </form>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <AgentLog events={events} loading={isSubmitting} />
      
      <div className="mt-6 text-sm text-gray-500">
        <h3 className="font-medium text-gray-700 mb-1">About this workflow</h3>
        <p>This agent workflow executes in three stages:</p>
        <ol className="list-decimal ml-5 space-y-1 mt-2">
          <li>The <strong>ResearchAgent</strong> searches the web for information and takes notes</li>
          <li>The <strong>WriteAgent</strong> uses those notes to create a report</li>
          <li>The <strong>ReviewAgent</strong> reviews the report and may request changes</li>
        </ol>
      </div>
    </div>
  );
}