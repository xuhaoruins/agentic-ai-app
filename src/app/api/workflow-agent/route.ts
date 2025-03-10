import { NextRequest } from 'next/server';
import { createWorkflowAgent } from '@/lib/workflow-agent/workflow-agent';
import { WorkflowAgentEvent } from '@/lib/types';

// Using Edge runtime for improved performance with streaming responses
// Note: This disables static generation for this API route, which is expected for dynamic API endpoints
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { userMsg } = await req.json();
    
    // Check for missing API keys
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Missing OpenAI API key" }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create transformer for streaming
    const transformer = new TransformStream();
    const writer = transformer.writable.getWriter();
    const encoder = new TextEncoder();

    // Start processing in background
    (async () => {
      try {
        // Send an initial message to start the stream
        await writer.write(encoder.encode(`data: ${JSON.stringify({
          type: 'agent_change',
          data: { agent_name: 'Initializing workflow...' }
        })}\n\n`));
        
        // Initialize workflow agent
        const agentWorkflow = await createWorkflowAgent(
          process.env.OPENAI_API_KEY!,
          process.env.TAVILY_API_KEY || ''
        );

        // Run the workflow
        const handler = agentWorkflow.run({ userMsg });

        let currentAgent: string | null | undefined = null;

        // Process events
        for await (const event of handler.streamEvents()) {
          let eventToSend: WorkflowAgentEvent | null = null;

          // Process agent change
          if (
            event.hasOwnProperty('currentAgentName') &&
            event.currentAgentName !== currentAgent
          ) {
            currentAgent = event.currentAgentName;
            eventToSend = {
              type: 'agent_change',
              data: { agent_name: currentAgent ?? undefined }
            };
          }
          // Process agent output - 添加安全检查以防止访问 undefined 的 content 属性
          else if (event.type === 'agentOutput' && event.response) {
            const content = event.response.content || '';
            if (content) {
              eventToSend = {
                type: 'agent_output',
                data: { content }
              };
            }
          }

          // Send event if we have one
          if (eventToSend) {
            await writer.write(
              encoder.encode(`data: ${JSON.stringify(eventToSend)}\n\n`)
            );
          }
        }

        await writer.close();
      } catch (error) {
        console.error('Streaming error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown streaming error';
        await writer.write(encoder.encode(`data: ${JSON.stringify({
          type: 'error',
          data: { error: errorMessage }
        })}\n\n`));
        await writer.close();
      }
    })();

    return new Response(transformer.readable, {
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
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}