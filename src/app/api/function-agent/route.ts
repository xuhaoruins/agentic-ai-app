import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { AzureOpenAI } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat';
import { azureRegions } from '@/lib/function-agent/azure-regions';
import { azureVmSize } from '@/lib/function-agent/azurevmsize';
import { PricingItem } from '@/lib/function-agent/price-api-types';
import { agentPrompt } from '@/lib/function-agent/agentPrompt';

export const runtime = 'edge';
export const maxDuration = 60;

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
    
    const { prompt } = body;
    console.log('Processing prompt:', prompt.substring(0, 50) + '...');
    
    // Use streaming response for better user experience
    const stream = await queryPricingWithStreamingResponse(prompt);
    
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

async function queryPricingWithStreamingResponse(prompt: string): Promise<ReadableStream> {
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
      endpoint: process.env.SECOND_AZURE_OPENAI_ENDPOINT, // Use endpoint instead of baseURL
      apiVersion: '2024-10-21',
    });
    
    console.log('Secondary AzureOpenAI client initialized');
  } catch (error) {
    console.error('Error initializing OpenAI clients:', error);
    throw new Error(`Failed to initialize OpenAI clients: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const encoder = new TextEncoder();
  
  const functions = [
    {
        name: "odata_query",
        description: "根据传入的 OData 查询条件从 Azure 零售价格 API 中获取数据，并返回合并后的 JSON 记录列表，仅使用 armRegionName and armSkuName 进行模糊查询.",
        parameters: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "OData 查询条件，使用模糊查询的方式，例如：armRegionName eq 'southcentralus' and contains(armSkuName, 'Redis')"
                }
            },
            required: ["query"]
        }
    }
];

  // Create stream transformer
  const stream = new ReadableStream({
    async start(controller) {
      try {
        console.log('Starting stream processing');
        
        // Step 1: Generate query filter
        const functionMessages: ChatCompletionMessageParam[] = [
          {
              role: "system",
              content: `你是Azure价格查询助手，如果用户询问Azure产品价格相关问题，必须先调用odata_query，才能够回复。如果用户询问其他问题，你可以委婉地拒绝。`
          },
          {
              role: "user",
              content: `Azure region mapping: ${JSON.stringify(azureRegions)}`
          },
          {
              role: "user",
              content: `Azure virtual machine size context: ${JSON.stringify(azureVmSize)}`
          },
          { role: "user", content: prompt }
      ];

        console.log('Sending request to OpenAI for function calling');
        
        let response;
        try {
          response = await client.chat.completions.create({
            messages: functionMessages,
            temperature: 1,
            model: 'gpt-4o',
            functions: functions,
            function_call: "auto"
          });
          console.log('Received function call response');
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
        
        // If no function call triggered, return direct response
        if (!functionCall || functionCall.name !== "odata_query") {
          console.log('No function call triggered, sending direct response');
          const directResponse = response.choices[0]?.message?.content || 'No response generated';
          
          // Send direct response as complete message
          const directResponseData = {
            type: 'direct_response',
            data: { content: directResponse }
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(directResponseData)}\n\n`));
          controller.close();
          return;
        }

        let args;
        let queryFilter;
        
        try {
          args = JSON.parse(functionCall.arguments || "{}");
          queryFilter = args.query;

          if (!queryFilter) {
            throw new Error('Empty query filter generated');
          }
          
          console.log('Generated query filter:', queryFilter);
        } catch (parseError) {
          console.error('Error parsing function arguments:', parseError);
          
          const parseErrorData = {
            type: 'error',
            data: { message: `Failed to parse query filter: ${parseError instanceof Error ? parseError.message : 'Unknown error'}` }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(parseErrorData)}\n\n`));
          controller.close();
          return;
        }

        // Step 2: Fetch price data with robust error handling
        let priceData = { Items: [] as PricingItem[] };
        
        try {
          console.log('Fetching price data with filter');
          priceData = await fetchPrices(queryFilter);
          console.log(`Fetched ${priceData.Items.length} price items`);
          
          // Step 3: Return price data immediately for display
          const initialData = {
            type: 'price_data',
            data: {
              Items: priceData.Items,
              totalCount: priceData.Items.length,
              filter: queryFilter
            }
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));
        } catch (priceError) {
          console.error('Error fetching price data:', priceError);
          
          // Send error to client but don't end stream - continue with empty data
          const priceErrorData = {
            type: 'price_data_error',
            data: { 
              message: `Price API error: ${priceError instanceof Error ? priceError.message : 'Unknown error'}`,
              Items: [],
              filter: queryFilter 
            }
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(priceErrorData)}\n\n`));
          
          // Continue with empty price data
          priceData = { Items: [] };
        }

        // Step 4: Start streaming chat completion
        try {
          console.log('Starting AI response generation');
          
          // Get the Azure OpenAI deployment name from env vars
          const deploymentName = process.env.AZURE_DEPLOYMENT_NAME || 'default-deployment';
          console.log('Using Azure OpenAI deployment:', deploymentName);
          
          const chatMessages: ChatCompletionMessageParam[] = [
            {
              role: "system",
              content: agentPrompt
            },
            {
              role: "user",
              content: `Price Context: ${JSON.stringify(priceData.Items.slice(0, 50))}`
            },
            { role: "user", content: prompt }
          ];

          // Fix: Use deployment name instead of model name with AzureOpenAI client
          const streamResponse = await azureClient.chat.completions.create({
            messages: chatMessages,
            temperature: 0.7,
            model: "gpt-4o-mini", // Use the Azure deployment name here
            stream: true
          });

          // Step 5: Stream the analysis response
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

          console.log('Completed streaming AI response');

          // Step 6: Send complete response for client storage
          const finalData = {
            type: 'ai_response_complete',
            data: { 
              content: aiResponseText,
              Items: priceData.Items,
              filter: queryFilter
            }
          };

          controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`));
        } catch (aiError) {
          console.error('Error generating AI response:', aiError);
          
          // Add more detailed error logging
          if (aiError instanceof Error) {
            console.error('Error details:', {
              message: aiError.message,
              name: aiError.name,
              stack: aiError.stack,
              // @ts-ignore - For capturing Azure OpenAI specific error details
              status: aiError.status,
              // @ts-ignore
              headers: aiError.headers,
              // @ts-ignore
              error: aiError.error
            });
          }
          
          // Fallback to using the primary client if secondary fails
          try {
            console.log('Attempting fallback to primary client');
            
            // Define chatMessages before using it in the fallback logic
            const chatMessages: ChatCompletionMessageParam[] = [
              {
                role: "system",
                content: agentPrompt
              },
              {
                role: "user",
                content: `Price Context: ${JSON.stringify(priceData.Items.slice(0, 50))}`
              },
              { role: "user", content: prompt }
            ];

            // Use the primary client as fallback with non-streaming response
            const fallbackResponse = await client.chat.completions.create({
              messages: chatMessages,
              temperature: 0.7,
              model: process.env.MODEL_NAME || 'gpt-4o',
              max_tokens: 1000
            });
            
            const aiResponseText = fallbackResponse.choices[0]?.message?.content || 
              'Unable to generate a detailed analysis of the pricing data.';
              
            // Send complete response as one chunk
            const finalData = {
              type: 'ai_response_complete',
              data: { 
                content: aiResponseText,
                Items: priceData.Items,
                filter: queryFilter
              }
            };
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`));
            
          } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            
            // Send error but try to keep the price data
            const aiErrorData = {
              type: 'ai_response_complete',
              data: { 
                content: `Sorry, I encountered an error analyzing the price data: ${aiError instanceof Error ? aiError.message : 'Unknown error'}`,
                Items: priceData.Items,
                filter: queryFilter
              }
            };
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(aiErrorData)}\n\n`));
          }
        }

        controller.close();
        console.log('Stream processing completed');

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

  return stream;
}

async function fetchPrices(filter: string) {
  console.log('Fetching prices from Azure API');
  const api_url = "https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview";
  let allItems: PricingItem[] = [];
  
  // Make sure filter is URL encoded
  const encodedFilter = encodeURIComponent(filter);
  let nextPageUrl = `${api_url}&$filter=${encodedFilter}`;
  let pageCount = 0;
  const maxPages = 3; // Limit to 3 pages to avoid timeouts

  try {
    while (nextPageUrl && pageCount < maxPages) {
      console.log(`Fetching price data page ${pageCount + 1}...`);
      pageCount++;
      
      const response = await fetch(nextPageUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        // Add a timeout for the fetch request
        signal: AbortSignal.timeout(10000) // 10 seconds timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: nextPageUrl,
          responseText: errorText.substring(0, 500) // Log first 500 chars to see error
        });
        throw new Error(`Failed to fetch prices: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Invalid content type response:', {
          contentType,
          responseText: responseText.substring(0, 500) // Log first 500 chars to debug
        });
        throw new Error(`Expected JSON but got ${contentType || 'unknown content type'}`);
      }

      const data = await response.json();
      
      if (data.Items && Array.isArray(data.Items)) {
        const processedItems = data.Items.map((item: Record<string, unknown>) => ({
          armSkuName: item.armSkuName || 'Unknown',
          retailPrice: typeof item.retailPrice === 'number' ? item.retailPrice : 0,
          unitOfMeasure: item.unitOfMeasure || 'Unknown',
          armRegionName: item.armRegionName || 'global',
          meterName: item.meterName || 'Unknown',
          productName: item.productName || 'Unknown',
          type: item.type || 'Unknown',
          location: item.location || null,
          reservationTerm: item.reservationTerm || null,
          savingsPlan: item.savingsPlan || null
        }));
        allItems = [...allItems, ...processedItems];
        console.log(`Added ${processedItems.length} items from page ${pageCount}`);
      } else {
        console.warn('No items found in API response:', data);
      }

      // Get next page or stop
      nextPageUrl = data.NextPageLink || '';
    }
    
    console.log(`Fetched a total of ${allItems.length} items in ${pageCount} pages`);
    return { Items: allItems };
  } catch (error) {
    console.error('Error fetching prices:', error);
    if (allItems.length > 0) {
      // If we have some items already, return them instead of failing completely
      console.log(`Returning ${allItems.length} items despite error`);
      return { Items: allItems };
    }
    throw error; // Re-throw if we have no items at all
  }
}