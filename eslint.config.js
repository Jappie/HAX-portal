import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import htmlPlugin from "@html-eslint/eslint-plugin";

export default [
  // 1. TypeScript & Algemene configuratie
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "@html-eslint": htmlPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,

      // 2. HTML controles (die wél bestaan) binnen je Hono html`...` strings
      "@html-eslint/no-duplicate-attrs": "error",    // Checkt op dubbele attributen
      "@html-eslint/no-extra-spacing-tags": "warn",   // Vervanger voor de oude spacing regel
      "@html-eslint/quotes": ["warn", "double"],      // Dwingt nette HTML quotes af ("")
    },
    settings: {
      // Zorgt dat de HTML-linter specifiek zoekt naar Hono's html`` literals
      "html/template-tags": ["html"]
    }
  }
];

