import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { AzureOpenAI } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat';
import { fetchAzurePrices, WebSearch } from '@/lib/function-agent/function-tools';
import { PricingItem } from '@/lib/function-agent/function-agent-types';
import { availableTools } from '@/lib/function-agent/tools-schema';
import { azurePriceAnalysisPrompt } from '@/lib/function-agent/azure-price-context';
// Add Function type import
import type { ChatCompletionCreateParams } from 'openai/resources/chat';

// Define the ToolSelection interface
interface ToolSelection {
  toolIds: string[];
}

export const runtime = 'edge';
export const maxDuration = 60;

// Global conversation context storage, keyed by session ID
const conversationContexts = new Map<string, ChatCompletionMessageParam[]>();

// Function to get or create conversation context
function getConversationContext(sessionId: string, reset: boolean = false): ChatCompletionMessageParam[] {
  if (reset || !conversationContexts.has(sessionId)) {
    // Initialize with system prompt
    const initialContext: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `你是一名经验丰富的助手，你可以熟练地根据用户的询问判断出使用哪个函数或工具。`
      }
    ];
    conversationContexts.set(sessionId, initialContext);
    return initialContext;
  }
  return conversationContexts.get(sessionId)!;
}

// Function to append messages to conversation context
function appendToConversationContext(
  sessionId: string, 
  messages: ChatCompletionMessageParam[]
): void {
  if (!conversationContexts.has(sessionId)) {
    getConversationContext(sessionId);
  }
  
  const currentContext = conversationContexts.get(sessionId)!;
  conversationContexts.set(sessionId, [...currentContext, ...messages]);
}

export async function POST(request: NextRequest) {
  try {
    console.log('Received request to function-agent API');
    
    // Parse request body
    const body = await request.json().catch(error => {
      console.error('Error parsing request body:', error);
      return null;
    });
    
    if (!body || !body.prompt) {
      console.error('Missing prompt in request body');
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }
    
    const { prompt, selectedTools, sessionId = 'default', resetContext } = body;
    console.log('Processing prompt:', prompt.substring(0, 50) + '...');
    console.log('Selected tools:', selectedTools?.toolIds || 'none');
    console.log('Session ID:', sessionId);
    
    // Handle context reset if requested
    if (resetContext) {
      console.log(`Resetting context for session ${sessionId}`);
      getConversationContext(sessionId, true);
    }
    
    // Use streaming response for better user experience
    const stream = await queryPricingWithStreamingResponse(prompt, selectedTools, sessionId);
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in function-agent API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('Full error details:', { message: errorMessage, stack: errorStack });
    
    return Response.json(
      { 
        error: 'Failed to process request', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}

async function queryPricingWithStreamingResponse(
  prompt: string, 
  selectedTools?: ToolSelection, 
  sessionId: string = 'default'
): Promise<ReadableStream> {
  // Check environment variables with detailed logging
  const missingEnvVars = [];
  
  if (!process.env.OPENAI_API_KEY) missingEnvVars.push('OPENAI_API_KEY');
  if (!process.env.AZURE_OPENAI_ENDPOINT) missingEnvVars.push('AZURE_OPENAI_ENDPOINT');
  if (!process.env.SECOND_OPENAI_API_KEY) missingEnvVars.push('SECOND_OPENAI_API_KEY');
  if (!process.env.SECOND_AZURE_OPENAI_ENDPOINT) missingEnvVars.push('SECOND_AZURE_OPENAI_ENDPOINT');
  
  if (missingEnvVars.length > 0) {
    console.error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
    throw new Error(`Missing environment variables: ${missingEnvVars.join(', ')}`);
  }
  
  console.log('All required environment variables are set');

  let client: OpenAI;
  let azureClient: AzureOpenAI;
  
  try {
    // First client initialization
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.AZURE_OPENAI_ENDPOINT
    });
    
    console.log('Primary OpenAI client initialized');
    
    // Fixed second client initialization for Azure OpenAI
    azureClient = new AzureOpenAI({
      apiKey: process.env.SECOND_OPENAI_API_KEY,
      endpoint: process.env.SECOND_AZURE_OPENAI_ENDPOINT,
      apiVersion: '2024-10-21',
    });
    
    console.log('Secondary AzureOpenAI client initialized');
  } catch (error) {
    console.error('Error initializing OpenAI clients:', error);
    throw new Error(`Failed to initialize OpenAI clients: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const encoder = new TextEncoder();
  
  // Determine if any tools are explicitly selected by the user
  const toolIds = selectedTools?.toolIds || [];
  const hasSelectedTools = toolIds.length > 0;
  
  // Only include tools that are explicitly selected
  const enabledTools = hasSelectedTools 
    ? availableTools.filter(tool => toolIds.includes(tool.id))
    : [];
  
  // Only use functions when tools are explicitly selected
  // Updated to ensure each function has the correct type
  const functions: ChatCompletionCreateParams.Function[] = enabledTools.map(tool => tool.functionDefinition as ChatCompletionCreateParams.Function);
  const shouldUseFunctions = functions.length > 0;
  
  console.log(`Tool selection status: ${hasSelectedTools ? 'Tools selected' : 'No tools selected'}`);
  console.log(`Function calling ${shouldUseFunctions ? 'enabled with ' + functions.length + ' functions' : 'disabled'}`);

  // Create stream transformer
  return new ReadableStream({
    async start(controller) {
      try {
        console.log('Starting stream processing');
        
        // Add the user's prompt to conversation context
        appendToConversationContext(sessionId, [{ role: "user", content: prompt }]);
        
        // Step 1: First completion - determine if function calling is needed
        await handleFirstCompletion(client, prompt, functions, azureClient, controller, encoder, sessionId, shouldUseFunctions);
      } catch (error) {
        console.error('Fatal stream error:', error);
        const errorData = {
          type: 'error',
          data: { message: error instanceof Error ? error.message : 'Unknown error in stream processing' }
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
        controller.close();
      }
    }
  });
}

// Step 1: First completion - determine if function calling is needed
async function handleFirstCompletion(
  client: OpenAI,
  prompt: string,
  functions: ChatCompletionCreateParams.Function[], // Updated type definition
  azureClient: AzureOpenAI,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  sessionId: string = 'default',
  shouldUseFunctions: boolean = false
) {
  // Get the current conversation context
  const conversationContext = getConversationContext(sessionId);
  
  console.log('Sending request to OpenAI with context length:', conversationContext.length);
  console.log('Function calling is', shouldUseFunctions ? 'enabled' : 'disabled');
  
  let response;
  try {
    // Only include function parameters when tools are selected
    response = await client.chat.completions.create({
      messages: conversationContext,
      temperature: 1,
      model: 'gpt-4o',
      ...(shouldUseFunctions ? {
        functions: functions,
        function_call: "auto"
      } : {})
    });
    
    console.log('Received completion response');
  } catch (error) {
    console.error('Error in function call request:', error);
    
    // Send error message to client
    const errorData = {
      type: 'error',
      data: { message: `OpenAI API error: ${error instanceof Error ? error.message : 'Unknown error'}` }
    };
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
    controller.close();
    return;
  }

  const functionCall = response.choices[0]?.message?.function_call;
  
  // Case: No function call or function calling disabled
  if (!functionCall || !shouldUseFunctions) {
    console.log('Processing direct response (no function calling)');
    const directResponse = response.choices[0]?.message?.content || 'No response generated';
    
    // Add the assistant's response to conversation context
    appendToConversationContext(sessionId, [{
      role: "assistant",
      content: directResponse
    }]);
    
    // Send direct response as complete message
    const directResponseData = {
      type: 'direct_response',
      data: { content: directResponse }
    };
    
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(directResponseData)}\n\n`));
    controller.close();
    return;
  }

  // Function calling path - only reached when shouldUseFunctions is true
  console.log('Function call detected:', JSON.stringify(functionCall));
  
  const functionName = functionCall.name; // Explicitly extract the function name
  console.log(`Processing function call: ${functionName}`);
  
  appendToConversationContext(sessionId, [{
    role: "assistant",
    content: null,
    function_call: {
      name: functionName,
      arguments: functionCall.arguments || "{}"
    }
  }]);

  // Parse function arguments
  let args;
  try {
    args = JSON.parse(functionCall.arguments || "{}");
    console.log(`Parsed function arguments for ${functionName}:`, args);
  } catch (parseError) {
    console.error('Error parsing function arguments:', parseError);
    
    const parseErrorData = {
      type: 'error',
      data: { message: `Failed to parse arguments: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` }
    };
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(parseErrorData)}\n\n`));
    controller.close();
    return;
  }
  
  // Step 2.1.2: Call the appropriate tool function based on function name
  let functionResult: { 
    items: PricingItem[], 
    filter: string,
    success: boolean,
    error?: string 
  };

  try {
    // Now we can use functionName here since it's defined in this scope
    console.log(`Starting execution of function: ${functionName}`);
    
    switch (functionName) {
      // Case for Azure price query function
      case 'azure_price_query': {
        console.log(`Executing azure_price_query with query: ${args.query}`);
        
        // Use the imported fetchAzurePrices function
        const priceData = await fetchAzurePrices(args.query);
        console.log(`Fetched ${priceData.Items.length} price items`);
        
        functionResult = {
          items: priceData.Items,
          filter: args.query,
          success: true
        };
        
        // Add function result to conversation context
        appendToConversationContext(sessionId, [{
          role: "function",
          name: functionCall.name,
          content: JSON.stringify({
            items: functionResult.items.slice(0, 100), // Limit to 50 items to avoid token limits
            filter: functionResult.filter,
            totalCount: functionResult.items.length
          })
        }]);

        // Also add the Azure price analysis prompt to guide the model
        appendToConversationContext(sessionId, [{
          role: "system",
          content: azurePriceAnalysisPrompt
        }]);

        break;

      }

      // case for web search function
      case 'web_search': {
        console.log(`Executing web_search with query: ${args.query}`);

        // Use the imported WebSearch function
        const searchResults = await WebSearch(args.query);
        console.log(`Fetched ${searchResults.Items.length} search results`);
        functionResult = {
          items: searchResults.Items,
          filter: args.query,
          success: true
        };
        // Add function result to conversation context
        appendToConversationContext(sessionId, [{
          role: "function",
          name: functionCall.name,
          content: JSON.stringify({
            items: functionResult.items.slice(0, 50), // Limit to 50 items to avoid token limits
            filter: functionResult.filter,
            totalCount: functionResult.items.length
          })
        }]);
        
        break;
      }

      default: {
        console.error(`Unknown function: ${functionName}`);
        throw new Error(`Unknown function: ${functionName}`);
      }
    }
    
    console.log(`Successfully executed function: ${functionName}`);
  } catch (error) {
    console.error(`Error executing function ${functionName}:`, error);
    
    // Send error but don't end stream yet
    const functionErrorData = {
      type: 'price_data_error',
      data: { 
        message: `Function execution error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        Items: [],
        filter: '' 
      }
    };
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(functionErrorData)}\n\n`));
    
    // Continue with empty result
    functionResult = {
      items: [],
      filter: args?.query || '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    // Add error result to conversation context
    appendToConversationContext(sessionId, [{
      role: "function",
      name: functionName,
      content: JSON.stringify({
        error: functionResult.error,
        success: false
      })
    }]);
  }

  // Step 2.1.3: Send function results to client for immediate display
  if (functionResult && functionResult.items && functionResult.items.length > 0) {
    console.log(`Sending ${functionName} data to client: ${functionResult.items.length} items`);
    const resultData = {
      type: functionName === 'azure_price_query' ? 'price_data' : 'web_search_data',
      data: {
        Items: functionResult.items,
        totalCount: functionResult.items.length,
        filter: functionResult.filter,
        resultType: functionName === 'azure_price_query' ? 'price' : 'web_search'
      }
    };
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(resultData)}\n\n`));
  } else {
    console.log(`No ${functionName} items to send to client`);
  }

  // Step 2.1.4: Perform second completion with updated conversation context
  await performSecondCompletion(
    prompt,
    functionResult?.items || [],
    functionResult?.filter || '',
    azureClient,
    controller,
    encoder,
    sessionId
  );
}

// Perform second completion with function results and conversation context
async function performSecondCompletion(
  prompt: string,
  items: PricingItem[],
  filter: string,
  azureClient: AzureOpenAI,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder,
  sessionId: string = 'default'
) {
  try {
    console.log('Starting second completion with conversation context');
    
    // Get the full conversation context including function results and system prompts
    const fullContext = getConversationContext(sessionId);
    console.log('Full context messages length:', fullContext.length);
    
    // Stream the second completion response
    const streamResponse = await azureClient.chat.completions.create({
      messages: fullContext,
      temperature: 0.7,
      model: "gpt-4o-mini",
      stream: true
    });

    // Stream the analysis response
    let aiResponseText = '';

    for await (const chunk of streamResponse) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        aiResponseText += content;
        
        const chunkData = {
          type: 'ai_response_chunk',
          data: { content }
        };
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkData)}\n\n`));
      }
    }

    // Add AI response to conversation context
    appendToConversationContext(sessionId, [{
      role: "assistant",
      content: aiResponseText
    }]);

    console.log('Completed streaming second completion');

    // Send complete response for client storage
    const finalData = {
      type: 'ai_response_complete',
      data: { 
        content: aiResponseText,
        Items: items,
        filter: filter,
        // Set resultType based on the function name stored in session context
        resultType: fullContext.some(msg => msg.role === 'assistant' && msg.function_call?.name === 'web_search')
          ? 'web_search'
          : 'price'
      }
    };

    controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`));
    controller.close();

  } catch (aiError) {
    console.error('Error generating second completion:', aiError);
    
    // Use fallback response or error message
    const errorMessage = `Sorry, I encountered an error analyzing the data: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`;
    
    const aiErrorData = {
      type: 'ai_response_complete',
      data: { 
        content: errorMessage,
        Items: items,
        filter: filter
      }
    };
    
    controller.enqueue(encoder.encode(`data: ${JSON.stringify(aiErrorData)}\n\n`));
    controller.close();
  }
}
