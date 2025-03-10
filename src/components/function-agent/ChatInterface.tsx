'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { PricingItem, ToolSelection } from '@/lib/function-agent/function-agent-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  id?: string; // Add unique identifier for messages
};

// Update ResultsData type to include resultType
type ResultsData = {
  items: any[]; // Generic item type to accommodate different result types
  filter: string;
  resultType?: string;
  aiResponse?: string;
};

interface ChatInterfaceProps {
  onResults: (data: ResultsData) => void;
  selectedTools: ToolSelection;
}

export default function ChatInterface({ onResults, selectedTools }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [typingAnimation, setTypingAnimation] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Add session ID state
  const [sessionId] = useState<string>(() => `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    // Add initial message
    setMessages([
      {
        role: 'assistant',
        content: 'Welcome to Function Agent! ',
        id: 'welcome-message'
      }
    ]);
  }, []);

  // Clear chat history function - keeps the welcome message and resets the server context
  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Welcome to Function Agent! ',
        id: 'welcome-message'
      }
    ]);
    setStreamingResponse('');
    // Also clear results
    onResults({ items: [], filter: '', aiResponse: undefined });
    
    // Make a request to reset the conversation context on the server
    fetch('/api/function-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        prompt: "Reset context",
        sessionId,
        resetContext: true
      }),
    }).catch(err => console.error('Error resetting context:', err));
  };

  useEffect(() => {
    // 修改滚动逻辑，仅在聊天容器内部滚动，而不是整个页面
    if (messagesEndRef.current && chatContainerRef.current) {
      const chatContainer = chatContainerRef.current.querySelector('.overflow-y-auto');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [messages, streamingResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Generate a unique ID for the message
    const userMessageId = `user-${Date.now()}`;
    
    // Add user message with unique ID
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      id: userMessageId
    }]);
    
    // Force immediate update to display user message
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Add loading message
    const loadingMsgId = `assistant-${Date.now()}`;
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: 'Searching...',
      id: loadingMsgId
    }]);
    setLoading(true);
    setTypingAnimation(true);
    setStreamingResponse('');

    try {
      // Include selected tools and session ID in the API request
      const response = await fetch('/api/function-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: userMessage,
          selectedTools, // Pass the selected tools
          sessionId // Pass the session ID to maintain conversation context
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          responseText: errorText.substring(0, 500) // Log first 500 chars to see error
        });
        throw new Error(`Query failed: ${response.status} ${response.statusText}`);
      }

      // 处理SSE流响应
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Failed to get reader from response');
      
      const decoder = new TextDecoder();
      let priceDataReceived = false;
      let aiResponseComplete = false;
      let fullAiResponse = '';
      let buffer = ''; // 添加缓冲区用于处理不完整的 JSON

      // 读取流式响应
      while (!aiResponseComplete) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        
        // 寻找完整的 SSE 消息
        const messages = [];
        let match;
        // 移除 's' 标志，使用更兼容的方式处理换行符
        const messageRegex = /data: ({.*?})\n\n/g;
        
        // 提取所有完整的消息
        while ((match = messageRegex.exec(buffer)) !== null) {
          messages.push(match[1]);
        }
        
        if (messages.length > 0) {
          // 更新缓冲区，只保留未完成的部分
          const lastIndex = buffer.lastIndexOf('data: {');
          const lastComplete = buffer.lastIndexOf('\n\n', lastIndex) + 2;
          buffer = lastIndex > lastComplete ? buffer.substring(lastIndex) : '';
          
          // 处理提取出的完整消息
          for (const messageJson of messages) {
            try {
              const data = JSON.parse(messageJson);
              
              // 处理不同类型的消息
              switch(data.type) {
                case 'price_data':
                case 'web_search_data':
                  // Received results data, show to user
                  const resultType = data.data.resultType || (data.type === 'price_data' ? 'price' : 'web_search');
                  priceDataReceived = true;
                  console.log(`Received ${resultType} data:`, data.data.Items.length, "items");
                  onResults({
                    items: data.data.Items,
                    filter: data.data.filter,
                    resultType: resultType,
                    aiResponse: undefined // Will be set when AI response is complete
                  });
                  break;
                  
                case 'ai_response_chunk':
                  // 收到AI响应的一部分，追加到已有的流响应中
                  if (priceDataReceived && data.data.content) {
                    fullAiResponse += data.data.content;
                    setStreamingResponse(fullAiResponse);
                  }
                  break;
                  
                case 'ai_response_complete':
                  // AI响应完成
                  aiResponseComplete = true;
                  if (priceDataReceived) {
                    // 隐藏流式响应，避免重复显示
                    setStreamingResponse('');
                    
                    // 更新最终的消息
                    setMessages(prev => prev.map(msg => 
                      msg.id === loadingMsgId 
                        ? { ...msg, content: fullAiResponse || data.data.content } 
                        : msg
                    ));
                    
                    // 确保也更新结果中的AI响应
                    onResults({
                      items: data.data.Items,
                      filter: data.data.filter,
                      resultType: data.data.resultType || (data.type === 'price_data' ? 'price' : 'web_search'),
                      aiResponse: fullAiResponse || data.data.content
                    });
                  }
                  break;
                
                case 'direct_response':
                  // 直接响应（无function call时）
                  aiResponseComplete = true;
                  
                  // 更新消息内容
                  setMessages(prev => prev.map(msg => 
                    msg.id === loadingMsgId 
                      ? { ...msg, content: data.data.content } 
                      : msg
                  ));
                  
                  // 清空结果（因为没有价格数据）
                  onResults({
                    items: [],
                    filter: '',
                    resultType: '',
                    aiResponse: data.data.content
                  });
                  break;
                  
                case 'error':
                  throw new Error(data.data.message || 'Unknown error in stream');
              }
            } catch (err) {
              console.error('Error parsing SSE JSON:', err, messageJson);
              // 如果是关键消息解析失败，尝试保持过程继续但记录错误
              if (messageJson.includes('"type":"error"')) {
                // 尝试提取错误信息，即使JSON解析失败
                const errorMatch = messageJson.match(/"message"\s*:\s*"([^"]+)"/);
                const errorMsg = errorMatch ? errorMatch[1] : 'Malformed error data from server';
                throw new Error(errorMsg);
              }
            }
          }
        }
      }
      
      // 如果流结束但未收到完成消息，完成处理
      if (!aiResponseComplete && priceDataReceived) {
        // 更新最终消息
        setMessages(prev => prev.map(msg => 
          msg.id === loadingMsgId 
            ? { ...msg, content: fullAiResponse || "Response processing completed" } 
            : msg
        ));

        setTypingAnimation(false);
        setStreamingResponse('');
      }
      
    } catch (error) {
      console.error('Error:', error);
      
      setTypingAnimation(false);
      setStreamingResponse('');
      
      // Update error message - find the loading message by ID and replace it
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMsgId 
          ? { ...msg, content: `Query error: ${error instanceof Error ? error.message : 'Unknown error'}` }
          : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  // Define example queries by tool type
  const exampleQueries = useMemo(() => ({
    azure_price_query: [
      { text: "D8s v4 in East US", query: "What's the price of Standard D8s v4 in East US?" },
      { text: "GPU VMs in West US 2", query: "Compare prices of GPU VMs in West US 2" },
    ],
    web_search: [
      { text: "Azure AI news", query: "Search for latest Microsoft Azure AI announcements" },
      { text: "Confidential Computing", query: "Find information about Azure Confidential Computing" },
    ]
  }), []);
  
  // Determine which queries to show based on selected tools
  const visibleQueries = useMemo(() => {
    const selectedToolIds = selectedTools.toolIds || [];
    const hasAzurePriceTool = selectedToolIds.includes('azure_price_query');
    const hasWebSearchTool = selectedToolIds.includes('web_search');
    
    let queries = [];
    if (hasAzurePriceTool) {
      queries.push(...exampleQueries.azure_price_query);
    }
    if (hasWebSearchTool) {
      queries.push(...exampleQueries.web_search);
    }
    
    // If no tools selected or queries empty, show a default message
    if (queries.length === 0) {
      return [{ text: "Select a tool first", query: "Please select a tool to continue" }];
    }
    
    // Limit to max 4 examples
    return queries.slice(0, 4);
  }, [selectedTools, exampleQueries]);

  return (
    <div ref={chatContainerRef} className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden h-full">
      {/* Add chat header with clear button */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
        <h3 className="text-sm font-medium text-gray-700">Chat History</h3>
        <button
          onClick={clearChat}
          className="text-xs px-2.5 py-1.5 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-300 hover:border-red-200 transition-colors flex items-center gap-1"
          disabled={loading || messages.length <= 1}
          title="Clear chat history"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
          </svg>
          Clear Chat
        </button>
      </div>
      
      {/* Chat messages area with improved text selection */}
      <div className="flex-1 p-4 overflow-y-auto selection:bg-blue-200">
        {messages.map((msg, index) => (
          <div 
            key={msg.id || index} 
            className={`mb-4 ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
            data-role={msg.role}
          >
            <div 
              className={`relative max-w-[85%] message-fade-in ${
                msg.role === 'user' 
                  ? 'ml-auto' 
                  : 'mr-auto'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div 
                className={`p-3.5 rounded-2xl shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white selection:bg-white/30 selection:text-white' 
                    : 'bg-gradient-to-br from-indigo-50 to-blue-100 text-gray-800 border border-blue-400 selection:bg-blue-200'
                }`}
              >
                {msg.role === 'user' ? (
                  <div className="whitespace-pre-wrap text-sm md:text-base user-select-all">{msg.content}</div>
                ) : (
                  <div className={`markdown-content user-select-all ${typingAnimation && msg.content === 'Searching...' ? 'animate-pulse' : ''}`}>
                    {typingAnimation && msg.content === 'Searching...' ? (
                      <div className="flex items-center space-x-1 h-6">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce bounce-delay-0"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce bounce-delay-150"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce bounce-delay-300"></div>
                      </div>
                    ) : (
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        skipHtml={true}
                        components={{
                          pre: (props) => <pre className="bg-gray-800 text-white p-3 rounded-md overflow-auto my-2 text-sm" {...props} />,
                          code: (props) => <code className="bg-blue-50 px-1 py-0.5 rounded text-sm font-mono border border-blue-200" {...props} />,
                          p: (props) => <p className="text-sm md:text-base mb-2 last:mb-0 font-medium" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                )}
              </div>
              
              <div 
                className={`text-xs mt-1 px-1 ${
                  msg.role === 'user' ? 'text-right text-gray-600' : 'text-gray-500'
                }`}
              >
                {msg.role === 'user' ? 'You' : 'Function Agent'}
              </div>
              
              <div
                className={`absolute w-2 h-2 ${
                  msg.role === 'user'
                    ? 'right-0 -mr-1 bg-blue-500'
                    : 'left-0 -ml-1 bg-blue-100'
                } bottom-[16px] transform rotate-45`}
                aria-hidden="true"
              ></div>
            </div>
          </div>
        ))}
        
        {/* Streaming response with improved text selection and contrast */}
        {streamingResponse && (
          <div className="mb-4 flex justify-start">
            <div className="relative max-w-[85%] mr-auto">
              <div className="p-3.5 rounded-2xl shadow-sm bg-gradient-to-br from-indigo-50 to-blue-100 text-gray-800 border border-blue-400 selection:bg-blue-200">
                <div className="markdown-content user-select-all">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    skipHtml={true}
                    components={{
                      pre: (props) => <pre className="bg-gray-800 text-white p-3 rounded-md overflow-auto my-2 text-sm" {...props} />,
                      code: (props) => <code className="bg-blue-50 px-1 py-0.5 rounded text-sm font-mono border border-blue-200" {...props} />,
                      p: (props) => <p className="text-sm md:text-base mb-2 last:mb-0 font-medium" {...props} />
                    }}
                  >
                    {streamingResponse}
                  </ReactMarkdown>
                </div>
              </div>
              
              <div className="text-xs mt-1 px-1 text-gray-500">
                Function Agent
              </div>
              
              <div 
                className="absolute w-2 h-2 left-0 -ml-1 bg-blue-100 bottom-[16px] transform rotate-45"
                aria-hidden="true"
              ></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form 
        onSubmit={handleSubmit} 
        className="border-t border-gray-200 p-3 md:p-4 bg-gradient-to-r from-gray-50 to-gray-100"
      >
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question or search for information..."
              className="w-full p-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all shadow-sm text-sm md:text-base"
              disabled={loading}
              spellCheck={false}
              autoFocus
              aria-label="Query input"
            />
            {input.trim() && !loading && (
              <button 
                type="button"
                onClick={() => setInput('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear input"
                title="Clear input"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </div>
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:from-blue-300 disabled:to-indigo-400 disabled:cursor-not-allowed transition-all shadow-sm flex items-center"
            aria-label={loading ? "Loading..." : "Send message"}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </span>
            ) : (
              <span className="sr-only">Send</span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        
        {/* Dynamic example queries based on selected tools */}
        <div className="mt-2 flex flex-wrap gap-2" role="list" aria-label="Example queries">
          {visibleQueries.map((queryItem, index) => (
            <button 
              key={index}
              type="button" 
              onClick={() => setInput(queryItem.query)}
              disabled={loading}
              className="text-xs bg-white py-1 px-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {queryItem.text}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}