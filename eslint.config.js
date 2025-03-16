import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: [
      "src/components/mcp-agent/CopilotActionHandler.tsx",
      "src/components/mcp-agent/ExampleConfigs.tsx",
      "src/components/mcp-agent/ToolCallRenderer.tsx",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "no-console": "off",
      "react/prop-types": "off",
      "max-len": "warn"
    },
  },
];

export default eslintConfig;
