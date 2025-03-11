# Agentic AI App

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Project Overview

This project is an AI-powered application with multiple agents designed to assist with various tasks related to Azure services. The application is built using Next.js and includes the following modules:

### Modules

- **Function Agent**: Provides a chat interface to query Azure prices and perform web searches.
  - `src/app/api/function-agent/route.ts`: Handles API requests for function agents, including Azure price queries and web searches.
  - `src/app/function-agent/page.tsx`: Contains the UI for the Function Agent, including chat interface and results display.
  - `src/components/function-agent/ChatInterface.tsx`: Implements the chat interface for the Function Agent.
  - `src/components/function-agent/Results.tsx`: Displays the results of queries made by the Function Agent.
  - `src/lib/function-agent/function-tools.ts`: Defines tools for the Function Agent, including Azure price queries and web searches.
  - `src/lib/function-agent/tools-schema.ts`: Defines the schema for the tools used in the Function Agent.

- **Instruct Agent**: Provides a chat interface to assist with documentation, code, text processing, and more.
  - `src/app/api/instruct-agent/route.ts`: Processes API requests for instruct agents, supporting various tools and models.
  - `src/app/instruct-agent/page.tsx`: Provides the UI for the Instruct Agent, allowing users to interact with different tools.
  - `src/lib/instruct-agent/tools-config.ts`: Configures tools and models for the Instruct Agent.

- **Workflow Agent**: Facilitates complex task workflows with multi-step AI processes.
  - `src/app/api/workflow-agent/route.ts`: Manages API requests for workflow agents, enabling multi-step AI workflows.
  - `src/app/workflow-agent/page.tsx`: Includes the UI for the Workflow Agent, facilitating complex task workflows.
  - `src/components/workflow-agent/AgentLog.tsx`: Logs events and outputs for the Workflow Agent.
  - `src/lib/workflow-agent/workflow-agent.ts`: Creates and manages the Workflow Agent, supporting multi-step AI workflows.

## Getting Started

First, clone the repository:

```bash
git clone https://github.com/xuhaoruins/agentic-ai-app.git
cd agentic-ai-app
```

Install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Deployment

### Deploy on Azure Static Web Apps

To deploy this project using Azure Static Web Apps, follow these steps:

1. **Create a new Static Web App**:
   - Go to the [Azure Portal](https://portal.azure.com/).
   - Click on "Create a resource" and search for "Static Web App".
   - Click "Create" and fill in the required details.

2. **Configure the build and deployment settings**:
   - Set the build details as follows:
     - **App location**: `/`
     - **API location**: `api`
     - **Output location**: `out`

3. **Connect to your GitHub repository**:
   - Authorize Azure to access your GitHub account.
   - Select the repository and branch you want to deploy.

4. **Deploy the app**:
   - Click "Review + create" and then "Create".
   - Azure will automatically build and deploy your app.

5. **Monitor the deployment**:
   - You can monitor the deployment status in the Azure Portal.
   - Once the deployment is complete, you will receive a URL to access your app.

For more details, refer to the [Azure Static Web Apps documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
