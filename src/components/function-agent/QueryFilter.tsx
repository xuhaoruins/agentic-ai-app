'use client';

import React from 'react';

interface QueryFilterProps {
  totalCount: number;
  filter: string;
  onClear: () => void;
}

export default function QueryFilter({ totalCount, filter, onClear }: QueryFilterProps) {
  const formatFilter = (filter: string) => {
    return filter.replace(/'/g, '"')
                .replace(/contains\((.*?)\)/g, (match) => `contains${match.slice(8, -1)}`)
                .replace(/and/g, '&&')
                .replace(/or/g, '||');
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Generated Query:</span>
          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
            {formatFilter(filter)}
          </code>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Found: <strong>{totalCount}</strong> results
          </span>
          <button
            onClick={onClear}
            className="text-sm px-3 py-1 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}