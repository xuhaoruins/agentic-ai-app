import { OpenAI } from "llamaindex";
import { WorkflowState } from "../types";
import { ChatMessage } from "../types";

// Define tool interface
interface Tool {
  name: string;
  description: string;
  // Add other properties tools might have
  [key: string]: unknown;
}

// Define chunk interfaces for streaming responses
interface StreamChunk {
  delta?: string | { content?: string };
  content?: string;
  choices?: Array<{
    delta?: { content?: string };
  }>;
  [key: string]: unknown;
}

// 简化版 Agent 实现，支持流式输出，不工作
export const createWorkflowAgent = async (
  openaiApiKey: string,
  tavilyApiKey: string,
  model = "gpt-4o"
) => {
  const llm = new OpenAI({
    model: model,
    apiKey: openaiApiKey,
  });

  // 定义 Agent 类
  class Agent {
    name: string;
    systemPrompt: string;
    tools: Tool[];

    constructor(name: string, systemPrompt: string, tools: Tool[] = []) {
      this.name = name;
      this.systemPrompt = systemPrompt;
      this.tools = tools;
    }

    async *executeTaskStreaming(userInput: string, state: WorkflowState): AsyncGenerator<{
      contentChunk: string;
      done?: boolean;
      nextAgent?: string;
      updatedState?: WorkflowState;
    }> {
      try {
        const messages: ChatMessage[] = [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: `Current state: ${JSON.stringify(state)}\n\nUser request: ${userInput}` }
        ];

        // 使用非流式响应先尝试
        try {
          // Convert any non-standard roles (like "developer") to "user" role
          const compatibleMessages = messages.map(msg => {
            // Check if the role is a standard one accepted by the API
            if (msg.role === "developer" || !["system", "user", "assistant", "function", "tool"].includes(msg.role)) {
              return { ...msg, role: "user" };
            }
            return msg;
          });
          
          const result = await llm.chat({
            messages: compatibleMessages,
          });

          const content = result.message?.content || '';
          let nextAgent: string | undefined = undefined;
          const updatedState = {...state};

          if (content) {
            // Convert MessageContent to string if it's not already a string
            const contentText = typeof content === 'string' 
              ? content 
              : Array.isArray(content)
                ? content.map(item => {
                    // Safe property access with type checking
                    if (typeof item === 'object' && item !== null) {
                      // Check if it's a text content item
                      if ('text' in item) {
                        return item.text;
                      }
                      // Handle image content or other types
                      else if ('image_url' in item) {
                        return '[Image content]';
                      }
                    }
                    // Default fallback
                    return String(item);
                  }).join('')
                : String(content);
                
            // 每次获取到新的内容块时，都产生一个输出
            yield { contentChunk: contentText };
            
            // 检查是否有特殊标记来确定下一个代理
            if (this.name === "ResearchAgent" && contentText.includes("RESEARCH_COMPLETE")) {
              nextAgent = "WriteAgent";
              const noteTitle = "Research Notes";
              updatedState.research_notes = {
                ...updatedState.research_notes,
                [noteTitle]: contentText.replace("RESEARCH_COMPLETE", "").trim()
              };
            } 
            else if (this.name === "WriteAgent" && contentText.includes("REPORT_COMPLETE")) {
              nextAgent = "ReviewAgent";
              updatedState.report_content = contentText.replace("REPORT_COMPLETE", "").trim();
            }
            else if (this.name === "ReviewAgent") {
              if (contentText.includes("REVIEW_COMPLETE")) {
                updatedState.review = contentText.replace("REVIEW_COMPLETE", "").trim();
                // 工作流结束
              } else if (contentText.includes("REVISE_REPORT")) {
                nextAgent = "WriteAgent";
                updatedState.review = contentText.replace("REVISE_REPORT", "").trim();
              }
            }
          }

          // 输出完成后，发送最终状态和下一个代理信息
          yield { 
            contentChunk: '', 
            done: true,
            nextAgent,
            updatedState 
          };
          
          return;
        } catch (error) {
          console.log("Non-streaming approach failed, trying streaming approach:", error);
        }

        // 备用：尝试使用流式响应
        const stream = await llm.chat({
          messages: messages as ChatMessage[],
          stream: true,
        });

        let accumulatedContent = "";
        let nextAgent: string | undefined = undefined;
        const updatedState = {...state};

        for await (const chunk of stream) {
          // Handle different chunk structures safely
          let content = '';
          
          if (chunk && typeof chunk === 'object') {
            // Try various ways to extract content from the chunk
            if (typeof chunk.delta === 'string') {
              content = chunk.delta;
            } 
            else if (chunk.delta && typeof chunk.delta === 'object') {
              // Use a type assertion to safely access the content property
              const deltaObj = chunk.delta as { content?: string };
              if (deltaObj.content !== undefined) {
                content = String(deltaObj.content);
              }
            }
            // Safely check for choices without directly accessing the property
            else {
              // Use type assertion and 'in' operator to check for properties
              const anyChunk = chunk as StreamChunk;
              
              // Check if choices exists and handle it
              if ('choices' in anyChunk && Array.isArray(anyChunk.choices) && anyChunk.choices.length > 0) {
                const choice = anyChunk.choices[0];
                if (choice && typeof choice.delta === 'object' && choice.delta) {
                  // Use a type assertion for delta
                  const deltaObj = choice.delta as { content?: string };
                  if (deltaObj.content !== undefined) {
                    content = String(deltaObj.content);
                  }
                }
              }
              // Final fallback check for content property
              else if ('content' in anyChunk) {
                content = String(anyChunk.content || '');
              }
            }
          }
          
          if (content) {
            accumulatedContent += content;
            
            // 每次获取到新的内容块时，都产生一个输出
            yield { contentChunk: content };
            
            // 检查是否有特殊标记来确定下一个代理
            if (this.name === "ResearchAgent" && accumulatedContent.includes("RESEARCH_COMPLETE")) {
              nextAgent = "WriteAgent";
              const noteTitle = "Research Notes";
              updatedState.research_notes = {
                ...updatedState.research_notes,
                [noteTitle]: accumulatedContent.replace("RESEARCH_COMPLETE", "").trim()
              };
            } 
            else if (this.name === "WriteAgent" && accumulatedContent.includes("REPORT_COMPLETE")) {
              nextAgent = "ReviewAgent";
              updatedState.report_content = accumulatedContent.replace("REPORT_COMPLETE", "").trim();
            }
            else if (this.name === "ReviewAgent") {
              if (accumulatedContent.includes("REVIEW_COMPLETE")) {
                updatedState.review = accumulatedContent.replace("REVIEW_COMPLETE", "").trim();
                // 工作流结束
              } else if (accumulatedContent.includes("REVISE_REPORT")) {
                nextAgent = "WriteAgent";
                updatedState.review = accumulatedContent.replace("REVISE_REPORT", "").trim();
              }
            }
          }
        }

        // 输出完成后，发送最终状态和下一个代理信息
        yield { 
          contentChunk: '', 
          done: true,
          nextAgent,
          updatedState 
        };

      } catch (error) {
        console.error(`Error executing ${this.name}:`, error);
        throw error;
      }
    }
  }

  // 创建工作流控制器
  class WorkflowController {
    agents: Record<string, Agent>;
    rootAgentName: string;
    state: WorkflowState;
    
    constructor(agents: Agent[], rootAgentName: string, initialState: WorkflowState) {
      this.agents = {};
      agents.forEach(agent => {
        this.agents[agent.name] = agent;
      });
      this.rootAgentName = rootAgentName;
      this.state = initialState;
    }
    
    run(input: { userMsg: string }) {
      return {
        streamEvents: async function*(this: WorkflowController) {
          let currentAgentName = this.rootAgentName;
          const userInput = input.userMsg;
          
          while (currentAgentName) {
            const currentAgent = this.agents[currentAgentName];
            
            if (!currentAgent) {
              throw new Error(`Agent ${currentAgentName} not found`);
            }
            
            // 发出 agent 变更事件
            yield {
              currentAgentName,
              type: 'agentChange'
            };
            
            // 流式执行当前 agent
            let fullResponse = '';
            
            try {
              for await (const result of currentAgent.executeTaskStreaming(userInput, this.state)) {
                // 素积完整响应
                if (result.contentChunk) {
                  fullResponse += result.contentChunk;
                  
                  // 产生流式输出事件
                  yield {
                    type: 'agentOutput',
                    response: { content: fullResponse } // 发送当前累积的全部内容，为了保持 markdown 格式正确
                  };
                }
                
                // 如果处理完成，更新状态并决定下一个代理
                if (result.done) {
                  this.state = result.updatedState!;
                  currentAgentName = result.nextAgent ? result.nextAgent : '';
                }
              }
            } catch (error) {
              console.error(`Error executing agent ${currentAgentName}:`, error);
              // 如果出错，给出一个默认响应并尝试继续工作流
              yield {
                type: 'agentOutput',
                response: { content: `Error executing ${currentAgentName}: ${error}` }
              };
              
              // 默认移动到下一个阶段
              if (currentAgentName === "ResearchAgent") {
                currentAgentName = "WriteAgent";
                this.state.research_notes = {
                  "Error": "Research was interrupted due to an error."
                };
              } else if (currentAgentName === "WriteAgent") {
                currentAgentName = "ReviewAgent";
                this.state.report_content = "Report generation was interrupted due to an error.";
              } else {
                // 如果是 ReviewAgent 或其他，退出工作流
                currentAgentName = '';
              }
            }
          }
        }.bind(this)
      };
    }
  }

  // 创建各个 agent
  const researchAgent = new Agent(
    "ResearchAgent",
    "You are the ResearchAgent that searches for information on a given topic. " +
    "Research the topic thoroughly and provide detailed, factual information. " +
    "Use Markdown formatting for better readability. " +
    "When you've completed your research, end your response with 'RESEARCH_COMPLETE'."
  );

  const writeAgent = new Agent(
    "WriteAgent",
    "You are the WriteAgent that writes reports based on research notes. " +
    "Structure your report with clear sections, including an introduction, main body, and conclusion. " +
    "Use Markdown formatting with proper headings (# for title, ## for sections, etc). " +
    "Include bullet points and numbered lists where appropriate. " +
    "Format any code or special content using markdown code blocks. " +
    "When you've completed the report, end your response with 'REPORT_COMPLETE'."
  );

  const reviewAgent = new Agent(
    "ReviewAgent",
    "You are the ReviewAgent that reviews reports. " +
    "Evaluate the report for accuracy, clarity, structure, and completeness. " +
    "Use Markdown formatting for your review. " +
    "If the report is satisfactory, end with 'REVIEW_COMPLETE'. " +
    "If changes are needed, suggest specific improvements and end with 'REVISE_REPORT'."
  );

  // 创建工作流控制器
  const workflow = new WorkflowController(
    [researchAgent, writeAgent, reviewAgent],
    "ResearchAgent",
    {
      research_notes: {},
      report_content: "Not written yet.",
      review: "Review required."
    }
  );

  return workflow;
};