# Agentic AI Application

A modern AI agent platform built with Next.js, featuring multiple specialized AI agents for different tasks.

## Project Overview

This project implements a multi-agent AI application with specialized components:

- **Function Agent**: Executes Azure price queries and web searches through function calling capabilities
- **Instruct Agent**: Processes documents and follows custom system prompts for specific tasks
- **Workflow Agent**: Coordinates multi-step AI processes through a chain of specialized agents

## Project Structure

### Core Components

- **Function Agent**: `/app/function-agent/` - Agent with tool-calling capabilities for Azure pricing and web search
- **Instruct Agent**: `/app/instruct-agent/` - Agent that follows specialized system prompts with document processing
- **Workflow Agent**: `/app/workflow-agent/` - Agent that coordinates multi-step processes through multiple agents

### Library Structure

- `/lib/function-agent/` - Function definitions, pricing tools and schemas
- `/lib/instruct-agent/` - Azure client, file parser and tools configuration
- `/lib/workflow-agent/` - Workflow orchestration and state management
- `/components/` - Reusable UI components for each agent

### API Routes

- `/app/api/function-agent/` - Handles function calling for Azure pricing and web search
- `/app/api/instruct-agent/` - Processes document uploads and prompt instructions
- `/app/api/workflow-agent/` - Coordinates multi-agent workflows with state management

## Getting Started

### Prerequisites

Create a `.env.local` file with the following environment variables:

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
