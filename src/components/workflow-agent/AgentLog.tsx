'use client';
import React, { useState, useEffect } from 'react';
import { WorkflowAgentEvent } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

interface AgentLogProps {
  events: WorkflowAgentEvent[];
  loading: boolean;
}

export default function AgentLog({ events, loading }: AgentLogProps) {
  const logEndRef = React.useRef<HTMLDivElement>(null);
  const [reportContent, setReportContent] = useState<string>('');
  const [hasReport, setHasReport] = useState<boolean>(false);

  // 自动滚动到底部
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  // 提取 WriteAgent 的完整报告内容
  useEffect(() => {
    const writeAgentOutput = events.filter(
      event => 
        event.type === 'agent_output' && 
        event.data.content && 
        events.some(e => e.type === 'agent_change' && e.data.agent_name === 'WriteAgent')
    );
    
    if (writeAgentOutput.length > 0) {
      const lastReport = writeAgentOutput[writeAgentOutput.length - 1].data.content || '';
      // 移除 REPORT_COMPLETE 标记
      const cleanedReport = lastReport.replace('REPORT_COMPLETE', '').trim();
      setReportContent(cleanedReport);
      setHasReport(!!cleanedReport);
    }
  }, [events]);

  // 下载 Markdown 文件
  const downloadMarkdown = () => {
    if (!reportContent) return;
    
    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderEvent = (event: WorkflowAgentEvent, index: number) => {
    const { type, data } = event;

    switch (type) {
      case 'agent_change':
        return (
          <div key={index} className="border-b border-gray-200 py-4">
            <div className="flex items-center mb-2">
              <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">🤖</div>
              <h3 className="text-lg font-medium">Agent: {data.agent_name}</h3>
            </div>
          </div>
        );
      case 'agent_output':
        return (
          <div key={index} className="py-3">
            {data.content && (
              <div className="bg-gray-50 rounded-lg p-3 mb-2">
                <ReactMarkdown>{data.content}</ReactMarkdown>
              </div>
            )}
            {data.tool_calls && data.tool_calls.length > 0 && (
              <div className="text-sm text-gray-600">
                Planning to use tools: {data.tool_calls.map(call => call.tool_name).join(', ')}
              </div>
            )}
          </div>
        );
      case 'tool_call':
        return (
          <div key={index} className="py-2">
            <div className="flex items-center">
              <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">🔨</div>
              <div>
                <div className="font-medium">Calling Tool: {data.tool_name}</div>
                {data.tool_args && (
                  <div className="text-sm text-gray-600 mt-1">
                    <div className="font-medium">Arguments:</div>
                    <pre className="bg-gray-50 p-2 rounded-md mt-1 overflow-x-auto text-xs">
                      {JSON.stringify(data.tool_args, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'tool_result':
        return (
          <div key={index} className="py-2">
            <div className="flex items-center">
              <div className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">🔧</div>
              <div className="w-full">
                <div className="font-medium">Tool Result ({data.tool_name}):</div>
                {data.tool_output && (
                  <div className="bg-gray-50 p-2 rounded-md mt-1 text-sm overflow-x-auto">
                    <ReactMarkdown>{data.tool_output}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Agent Workflow Execution</h2>
        {hasReport && (
          <button
            onClick={downloadMarkdown}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            <span className="material-icons-outlined text-sm">download</span>
            <span>Download Report</span>
          </button>
        )}
      </div>
      
      {/* 固定高度的滚动区域 */}
      <div className="overflow-y-auto h-[500px] border border-gray-200 rounded-lg p-2 space-y-2">
        {events.length === 0 && !loading ? (
          <div className="text-gray-500 text-center py-8">
            No events yet. Start a workflow by submitting your request.
          </div>
        ) : (
          events.map(renderEvent)
        )}
        {loading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        <div ref={logEndRef}></div>
      </div>
    </div>
  );
}