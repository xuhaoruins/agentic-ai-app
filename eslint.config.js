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
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "max-len": ["warn", { "code": 180 }],
      "@next/next/no-head-element": "off"
    }
  },
  {
    files: [
      "src/components/mcp-agent/CopilotActionHandler.tsx",
      "src/components/mcp-agent/ExampleConfigs.tsx",
      "src/components/mcp-agent/ToolCallRenderer.tsx",
      "src/app/function-agent/page.tsx",
      "src/app/instruct-agent/page.tsx",
      "src/types/layout.tsx"
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-console": "off",
      "react/prop-types": "off",
      "max-len": "off"
    },
  },
];

export default eslintConfig;
