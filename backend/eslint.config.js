import js from "@eslint/js";

const nodeGlobals = {
  Buffer: "readonly",
  console: "readonly",
  process: "readonly",
  setTimeout: "readonly",
};

export default [
  {
    ignores: ["node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: nodeGlobals,
    },
    rules: {
      "no-unused-vars": ["error", { args: "none", caughtErrors: "none" }],
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...nodeGlobals,
        module: "readonly",
        require: "readonly",
      },
    },
    rules: {
      "no-unused-vars": ["error", { args: "none", caughtErrors: "none" }],
    },
  },
];
