import OpenAI from 'openai';
// Remove unused import
// import { ChatMessage } from '../types';

type OpenAIChatRole = 'system' | 'user' | 'assistant';

// Comment out unused interface
// interface OpenAIChatMessage {
//   role: OpenAIChatRole;
//   content: string;
// }

export const createChatClient = (endpoint: string, apiKey: string) => {
  console.log('Creating chat client with endpoint:', endpoint);
  
  try {
    return new OpenAI({ 
      baseURL: endpoint,
      apiKey: apiKey,
      dangerouslyAllowBrowser: false // 确保不在浏览器中使用API密钥
    });
  } catch (error) {
    console.error('Error creating OpenAI client:', error);
    throw error;
  }
};

// Comment out unused interface
// interface BingSearchResponse {
//   webPages?: {
//     value: Array<{
//       name: string;
//       url: string;
//       snippet: string;
//     }>;
//   };
// }

export const createSearchClient = (apiKey: string) => {
  return {
    async call(query: string) {
      try {
        const response = await fetch(`https://api.tavily.com/search?api_key=${apiKey}&q=${encodeURIComponent(query)}`);
        const data = await response.json();
        return data.results || [];
      } catch (error) {
        console.error('Search engine error:', error);
        return [];
      }
    }
  };
};