// eslint.config.js
import js from "@eslint/js";
import react from "eslint-plugin-react";

export default [
  js.configs.recommended,
  {
    plugins: { react },
    rules: {
      "no-unused-vars": "off", // 👈 turn off unused-vars warnings
      "react/react-in-jsx-scope": "off", // Vite/React doesn’t need React import
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
