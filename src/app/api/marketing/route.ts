import { NextRequest } from 'next/server';
import { createChatClient, streamCompletion } from '@/lib/instruct-agent/azure-client';
import { MarketingContent } from '@/lib/types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { prompt, content, productValues, emotionValues, ageRange, wordCount } = await req.json();

    // Initialize chat client
    const client = createChatClient(
      process.env.AZURE_OPENAI_ENDPOINT!,
      process.env.OPENAI_API_KEY!
    );

    // Create messages array
    const messages = [{
      role: 'system' as const,
      content: `You are a marketing content expert. Generate engaging marketing content based on the provided parameters:
- Match product values: ${productValues.join(', ')}
- Evoke emotions: ${emotionValues.join(', ')}
- Target age range: ${ageRange[0]}-${data.ageRange[1]}
- Word count: around ${wordCount}
The content should be concise, impactful, and resonate with the target audience.`
    }, {
      role: 'user' as const,
      content: prompt
    }];

    // Create stream transformer
    const transformer = new TransformStream();
    const writer = transformer.writable.getWriter();
    const encoder = new TextEncoder();

    // Start streaming response
    streamCompletion(client, messages, 'gpt-4').then(async generator => {
      try {
        for await (const chunk of generator) {
          await writer.write(encoder.encode(`data: ${chunk}\n\n`));
        }
        await writer.close();
      } catch (error) {
        console.error('Streaming error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown streaming error';
        await writer.write(encoder.encode(`data: Error: ${errorMessage}\n\n`));
        await writer.close();
      }
    }).catch(async error => {
      console.error('Stream setup error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown setup error';
      await writer.write(encoder.encode(`data: Error: ${errorMessage}\n\n`));
      await writer.close();
    });

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