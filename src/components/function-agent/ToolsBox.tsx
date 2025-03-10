'use client';

import React, { useState } from 'react';
import { Tool, ToolSelection } from '@/lib/function-agent/function-agent-types';

interface ToolsBoxProps {
  tools: Tool[];
  onToolSelectionChange: (selection: ToolSelection) => void;
}

export default function ToolsBox({ tools, onToolSelectionChange }: ToolsBoxProps) {
  const [selectedTools, setSelectedTools] = useState<string[]>(
    tools.filter(t => t.enabled).map(t => t.id)
  );

  const handleToolToggle = (toolId: string) => {
    const newSelection = selectedTools.includes(toolId)
      ? selectedTools.filter(id => id !== toolId)
      : [...selectedTools, toolId];
      
    setSelectedTools(newSelection);
    onToolSelectionChange({ toolIds: newSelection });
  };

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden h-full border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h3 className="text-sm font-medium text-gray-700">Available Tools</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        <div className="space-y-2">
          {tools.map(tool => (
            <div 
              key={tool.id}
              className="flex items-start space-x-3 p-2 md:p-3 rounded-lg border border-gray-200 hover:border-indigo-300 transition-colors"
            >
              <div className="flex items-center h-5">
                <input
                  id={`tool-${tool.id}`}
                  name={`tool-${tool.id}`}
                  type="checkbox"
                  checked={selectedTools.includes(tool.id)}
                  onChange={() => handleToolToggle(tool.id)}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className="flex-1 min-w-0">
                <label htmlFor={`tool-${tool.id}`} className="text-sm font-medium text-gray-700 cursor-pointer">
                  {tool.name}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {tool.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-3 py-2 md:px-4 md:py-3 bg-gradient-to-r from-gray-50 to-indigo-50 text-xs text-gray-500">
        {selectedTools.length === 0 ? (
          <p>No tools selected. Chat will use basic capabilities only.</p>
        ) : (
          <p>{selectedTools.length} tool{selectedTools.length !== 1 && 's'} selected.</p>
        )}
      </div>
    </div>
  );
}
