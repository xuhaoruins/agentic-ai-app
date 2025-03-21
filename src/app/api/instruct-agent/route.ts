import { NextRequest } from 'next/server';
import { createChatClient, createSearchClient } from '@/lib/instruct-agent/azure-client';
import { ChatMessage } from '@/lib/types';
import { getToolById } from '@/lib/instruct-agent/tools-config';

// Using Edge runtime for improved performance with streaming responses
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

    // Get the selected tool and system prompt
    const selectedTool = getToolById(tool);
    console.log(`Selected tool: ${selectedTool.name}, System Prompt:`, systemPrompt);
    
    // Check if prompt contains document context
    const hasDocumentContext = prompt.includes("==== DOCUMENT CONTEXT ====");
    console.log(`Prompt contains document context: ${hasDocumentContext}`);
    if (hasDocumentContext) {
      // Extract some sample of the document content for logging
      const contextStart = prompt.indexOf("==== DOCUMENT CONTEXT ====");
      const contextEnd = prompt.indexOf("==== END OF DOCUMENT CONTEXT ====");
      if (contextStart > -1 && contextEnd > -1) {
        const docSample = prompt.substring(contextStart, contextStart + 200) + "...";
        console.log("Document context sample:", docSample);
        
        // Count how many documents are included
        const docCount = (prompt.match(/\[Document \d+:/g) || []).length;
        console.log(`Number of documents included: ${docCount}`);
      }
    }

    // Create a ReadableStream for SSE output
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        
        try {
          // Initialize clients
          const client = createChatClient(
            process.env.AZURE_OPENAI_ENDPOINT!,
            process.env.OPENAI_API_KEY!
          );

          const searchClient = webSearchEnabled ? createSearchClient(
            process.env.TAVILY_API_KEY!
          ) : null;

          // Get web search results (if enabled)
          let webResults = '';
          if (webSearchEnabled && searchClient) {
            try {
              const searchResults = await searchClient.call(prompt);
              // Limit to top 3 results
              const top3Results = searchResults.slice(0, 3);
              
              // Log each individual search result
              console.log(`Found ${searchResults.length} results, using top 3:`);
              
              // Add this interface definition before the forEach call
              interface SearchResult {
                title: string;
                url: string;
                content: string;
                // Add any other properties that might be present in search results
              }

              // Then update the forEach loop with proper type annotation
              top3Results.forEach((result: SearchResult, index: number) => {
                console.log(`[${index + 1}] Title: ${result.title}`);
                console.log(`    URL: ${result.url}`);
                console.log(`    Content: ${result.content.substring(0, 100)}...`);
              });
              
              // Format the top 3 results for inclusion in the message
              webResults = top3Results.map((result: SearchResult) => 
                `Title: ${result.title}\nURL: ${result.url}\nContent: ${result.content}`
              ).join('\n\n');
            } catch (error) {
              console.error('Web search error:', error);
            }
          }

          // Prepare final prompt - ensure document context is preserved when web search is used
          let finalUserPrompt = prompt;
          if (webResults) {
            // When web search is enabled and document context exists, we need to preserve both
            if (hasDocumentContext) {
              // Split the prompt to separate document context from user query
              const docContextStart = prompt.indexOf("==== DOCUMENT CONTEXT ====");
              const docContextEnd = prompt.indexOf("==== END OF DOCUMENT CONTEXT ====") + "==== END OF DOCUMENT CONTEXT ====".length;
              
              // Extract parts
              const userQuery = prompt.substring(0, docContextStart).trim();
              const docContext = prompt.substring(docContextStart, docContextEnd);
              const finalInstructions = prompt.substring(docContextEnd).trim();
              
              // Combine with web results
              finalUserPrompt = `Context from web search (top 3 results):\n${webResults}\n\n${docContext}\n\nUser query: ${userQuery}\n\n${finalInstructions}`;
              
              console.log("Combined document context and web search results");
            } else {
              // Just web search, no document context
              finalUserPrompt = `Context from web search (top 3 results):\n${webResults}\n\nUser query: ${prompt}`;
            }
          }

          // Prepare chat messages
          const formattedMessages = [
            // System prompt always comes first
            { role: 'system', content: systemPrompt },
            // Add message history (excluding system messages)
            ...messages.filter((m: ChatMessage) => m.role !== 'system').map((msg: ChatMessage) => ({
              role: msg.role as "system" | "user" | "assistant",
              content: msg.content
            })),
            // Add current user message with context (if any)
            { 
              role: 'user', 
              content: finalUserPrompt
            }
          ];

          console.log('Final chat messages:');
          formattedMessages.slice(0, Math.min(3, formattedMessages.length)).forEach((msg, i) => {
            console.log(`[${i}] ${msg.role}: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`);
          });
          
          // Log the total length of the prompt to help diagnose truncation issues
          console.log(`Full prompt length: ${finalUserPrompt.length} characters`);

          // Create streaming chat completion
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