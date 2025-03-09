declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY: string;
      AZURE_OPENAI_ENDPOINT: string;
      OPENAI_API_VERSION: string;
      TAVILY_API_KEY: string;
      SECOND_OPENAI_API_KEY: string;
      SECOND_AZURE_OPENAI_ENDPOINT: string;
      SECOND_AZURE_OPENAI_MODEL: string;
    }
  }
}