import { OpenAI } from "llamaindex";
import { WorkflowState } from "../types";
import { ChatMessage } from "../types";

// 简化版 Agent 实现，不使用 @llamaindex/workflow
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
    tools: any[];

    constructor(name: string, systemPrompt: string, tools: any[] = []) {
      this.name = name;
      this.systemPrompt = systemPrompt;
      this.tools = tools;
    }

    async executeTask(userInput: string, state: WorkflowState): Promise<{
      output: string;
      nextAgent?: string;
      updatedState: WorkflowState;
    }> {
      try {
        const messages: ChatMessage[] = [
          { role: 'system', content: this.systemPrompt },
          { role: 'user', content: `Current state: ${JSON.stringify(state)}\n\nUser request: ${userInput}` }
        ];

        const response = await llm.chat({
          messages: messages as any,
        });

        // 简单的状态转换逻辑
        let updatedState = {...state};
        let nextAgent: string | undefined = undefined;
        
        // 分析响应以决定下一个 agent
        const content = response.message.content || '';
        
        if (this.name === "ResearchAgent") {
          if (content.includes("RESEARCH_COMPLETE")) {
            nextAgent = "WriteAgent";
            // 模拟记录研究笔记
            const noteTitle = "Research Notes";
            updatedState.research_notes = {
              ...updatedState.research_notes,
              [noteTitle]: content.replace("RESEARCH_COMPLETE", "").trim()
            };
          }
        } 
        else if (this.name === "WriteAgent") {
          if (content.includes("REPORT_COMPLETE")) {
            nextAgent = "ReviewAgent";
            updatedState.report_content = content.replace("REPORT_COMPLETE", "").trim();
          }
        } 
        else if (this.name === "ReviewAgent") {
          if (content.includes("REVIEW_COMPLETE")) {
            updatedState.review = content.replace("REVIEW_COMPLETE", "").trim();
            // 完成工作流
          } else if (content.includes("REVISE_REPORT")) {
            nextAgent = "WriteAgent";
            updatedState.review = content.replace("REVISE_REPORT", "").trim();
          }
        }

        return {
          output: content,
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
        streamEvents: async function*() {
          let currentAgentName = this.rootAgentName;
          let userInput = input.userMsg;
          
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
            
            // 执行当前 agent
            const result = await currentAgent.executeTask(userInput, this.state);
            this.state = result.updatedState;
            
            // 发出 agent 输出事件
            yield {
              type: 'agentOutput',
              response: { content: result.output }
            };
            
            // 决定下一个 agent
            currentAgentName = result.nextAgent ? result.nextAgent : '';
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
    "When you've completed your research, end your response with 'RESEARCH_COMPLETE'."
  );

  const writeAgent = new Agent(
    "WriteAgent",
    "You are the WriteAgent that writes reports based on research notes. " +
    "Structure your report with clear sections, including an introduction, main body, and conclusion. " +
    "Use markdown formatting for better readability. " +
    "When you've completed the report, end your response with 'REPORT_COMPLETE'."
  );

  const reviewAgent = new Agent(
    "ReviewAgent",
    "You are the ReviewAgent that reviews reports. " +
    "Evaluate the report for accuracy, clarity, structure, and completeness. " +
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