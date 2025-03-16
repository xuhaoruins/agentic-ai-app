export interface SessionState {
  temperature: number;
  initialized: boolean;
  openai_api_base: string;
  openai_api_key: string;
  chat_model: string;
  embedding_model: string;
  bing_endpoint: string;
  bing_api_key: string;
  cv_endpoint: string;
  cv_key: string;
  gpt4v_model: string;
}

export type ChatRole = 'system' | 'user' | 'assistant' | 'developer';

export interface ChatMessage {
  role: ChatRole;
  content: string;
  id?: string;
}

export interface PricingItem {
  armSkuName: string;
  retailPrice: number;
  unitOfMeasure: string;
  armRegionName: string;
  meterName: string;
  productName: string;
  type: string;
  location?: string;
  reservationTerm?: string;
  savingsPlan?: Array<{ term: string, retailPrice: string }>;
}

export interface InstructAgentState {
  model: string;
  webSearchEnabled: boolean;
  tool: string;
  systemPrompt: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface StreamingResponseData {
  type: 'direct_response' | 'web_search' | 'function_result' | 'error';
  data: {
    content?: string;
    results?: SearchResult[];
    error?: string;
  };
}

// Workflow Agent Types
export interface WorkflowAgentRequest {
  userMsg: string;
}

export interface WorkflowAgentEvent {
  type: 'agent_change' | 'agent_output' | 'tool_call' | 'tool_result';
  data: {
    agent_name?: string;
    content?: string;
    tool_name?: string;
    tool_args?: Record<string, unknown>; // Changed from any to unknown
    tool_output?: string;
    tool_calls?: Array<{tool_name: string}>;
  };
}

export interface WorkflowState {
  research_notes: Record<string, string>;
  report_content: string;
  review: string;
}