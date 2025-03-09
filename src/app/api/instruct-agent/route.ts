import { NextRequest } from 'next/server';
import { createChatClient, createSearchClient } from '@/lib/instruct-agent/azure-client';
import { ChatMessage } from '@/lib/types';
import { getToolById } from '@/lib/instruct-agent/tools-config';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, prompt, tool, model, webSearchEnabled } = await req.json();

    if (!messages || !prompt || !tool || !model) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 获取选定的工具和对应的系统提示
    const selectedTool = getToolById(tool);
    console.log(`Selected tool: ${selectedTool.name}, System Prompt:`, systemPrompt); 

    // 创建一个 ReadableStream 来输出 SSE 数据
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          // 初始化客户端
          const client = createChatClient(
            process.env.AZURE_OPENAI_ENDPOINT!,
            process.env.OPENAI_API_KEY!
          );

          const searchClient = webSearchEnabled ? createSearchClient(
            process.env.TAVILY_API_KEY!
          ) : null;

          // 获取网络搜索结果（如果启用）
          let webResults = '';
          if (webSearchEnabled && searchClient) {
            try {
              const searchResults = await searchClient.call(prompt);
              // Limit to top 3 results
              const top3Results = searchResults.slice(0, 3);
              
              // Log each individual search result
              console.log(`Found ${searchResults.length} results, using top 3:`);
              top3Results.forEach((result, index) => {
                console.log(`[${index + 1}] Title: ${result.title}`);
                console.log(`    URL: ${result.url}`);
                console.log(`    Content: ${result.content.substring(0, 100)}...`);
              });
              
              // Format the top 3 results for inclusion in the message
              webResults = top3Results.map(result => 
                `Title: ${result.title}\nURL: ${result.url}\nContent: ${result.content}`
              ).join('\n\n');
            } catch (error) {
              console.error('Web search error:', error);
            }
          }

          // 准备聊天消息
          const formattedMessages = [
            // 系统提示始终位于第一位
            { role: 'system', content: systemPrompt },
            // 添加消息历史（不包括系统消息）
            ...messages.filter(m => m.role !== 'system').map(msg => ({
              role: msg.role as "system" | "user" | "assistant",
              content: msg.content
            })),
            // 添加当前用户消息及上下文（如果有）
            { 
              role: 'user', 
              content: webResults ? `Context from web search (top 3 results):\n${webResults}\n\nUser query: ${prompt}` : prompt
            }
          ];

          console.log('Final chat messages:');
          formattedMessages.slice(0, Math.min(3, formattedMessages.length)).forEach((msg, i) => {
            console.log(`[${i}] ${msg.role}: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`);
          });

          // 创建流式聊天完成
          const openAIStream = await client.chat.completions.create({
            model: model,
            messages: formattedMessages,
            stream: true,
            stream_options: { include_usage: true }
          });

          // 处理返回的流
          let usage = null;
          for await (const part of openAIStream) {
            const content = part.choices[0]?.delta?.content || '';
            if (content) {
              console.log(`Streaming content chunk: "${content}"`);
              
              // 发送文本内容，确保使用JSON格式化，保持SSE格式规范
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(content)}\n\n`));
            }

            if (part.usage) {
              usage = part.usage;
            }
          }

          // 记录使用情况统计
          if (usage) {
            console.log(`Usage Statistics - Prompt tokens: ${usage.prompt_tokens}, Completion tokens: ${usage.completion_tokens}, Total tokens: ${usage.total_tokens}`);
          }

          // 完成后关闭流
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown streaming error';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
          controller.close();
        }
      }
    });

    // 返回 SSE 响应
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Request handling error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}