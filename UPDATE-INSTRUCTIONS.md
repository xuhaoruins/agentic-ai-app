# CopilotKit Update Instructions

The CopilotKit dev console has indicated that the current version (1.6.0) is outdated.
To update to version 1.7.1, run either of the following commands:

## Using npm

```bash
npm install @copilotkit/react-core@1.7.1 @copilotkit/react-ui@1.7.1 @copilotkit/react-textarea@1.7.1 @copilotkit/runtime@1.7.1
```

## Using pnpm (recommended)

```bash
pnpm install @copilotkit/react-core@1.7.1 @copilotkit/react-ui@1.7.1 @copilotkit/react-textarea@1.7.1 @copilotkit/runtime@1.7.1
```

After running the appropriate command, the pnpm-lock.yaml file will be automatically updated with the new dependency versions.

## What's Included in the Update

This update includes:
- Updated core libraries from 1.6.0 to 1.7.1
- Addition of the react-textarea component (new dependency)

Please restart your development server after updating:

```bash
pnpm dev
```
