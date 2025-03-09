export interface Tool {
  id: string;
  name: string;
  systemPrompt: string;
}

export interface Model {
  id: string;
  name: string;
}

export const tools: Tool[] = [
  {
    id: 'translator',
    name: 'Translator',
    systemPrompt: `<instructions>
Your task is to translate user input content into native-level Chinese.
</instructions>
<guidelines>
- Preserve the original meaning and tone.
- Adapt idiomatic expressions to suit cultural contexts.
- Maintain proper grammar and natural phrasing in the target language.
- The translated content shall be fluent and easy to understand.
- No additional content or explanations shall be added
</guidelines>`
  },
  {
    id: 'polisher',
    name: 'Polisher',
    systemPrompt: `<instructions>
You are professional editor and writing polisher. 
Your task is to refine contet to enhance its clarity, conciseness, and structure while preserving its core message.
</instructions>
<output>
output language: English
</output>
<guidelines>
- Ensure that the essential meaning and intent of the original prompt remain unchanged.
- Use clear, straightforward language to eliminate ambiguity and make the message easy to understand.
- Ensure that the text is grammatically correct and well-punctuated to enhance readability.
- Tailor the language and style to suit the intended audience, ensuring the tone is professional and accessible.
</guidelines>`
},
  {
    id: 'content-writer',
    name: 'Content Writer',
    systemPrompt: `<instructions>
  You are a professional content writer. Your task is to create engaging, well-structured, and informative content that resonates with the target audience.'
<output>
output language: Chinese
</output>
<guidelines>
- Tone: Informative, engaging, and slightly conversational.
- Style: Use clear and concise language, avoiding jargon unless necessary.
- Structure: Organize content logically with clear headings and subheadings.
</guidelines>
    `  
    },
];

export const models: Model[] = [
    {
        id: 'gpt-4o-mini',
        name: 'gpt-4o-mini'
    },
    {
        id: 'gpt-4o',
        name: 'gpt-4o'
    },
    {
        id: 'o3-mini',
        name: 'o3-Mini'
    },
    {
        id: 'deepseek-v3',
        name: 'deepseek-v3'
    },
    {
        id: 'deepseek-r1',
        name: 'Deepseek-R1'
    }
];

export function getToolById(id: string) {
  return tools.find(tool => tool.id === id) || tools[0];
}