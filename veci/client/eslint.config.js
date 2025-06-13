import eslintPluginImport from "eslint-plugin-import";
import eslintPluginReact from "eslint-plugin-react";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json"
      }
    },
    plugins: {
      import: eslintPluginImport,
      react: eslintPluginReact,
      "@typescript-eslint": tseslint
    },
    rules: {
      "import/no-unresolved": "error"
    },
    settings: {
      "import/resolver": {
        alias: {
          map: [
            ["@", "./src"],
            ["@shared", "./src/shared"]
          ],
          extensions: [".js", ".jsx", ".ts", ".tsx"]
        }
      },
      react: {
        version: "detect"
      }
    }
  }
];