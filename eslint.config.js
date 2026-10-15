import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "coverage"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: { ecmaVersion: 2020, globals: globals.browser },
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Ràng buộc dự án: không gọi localStorage trực tiếp ngoài store/repository
      "no-restricted-globals": ["error", { name: "localStorage", message: "Dùng store/repository thay vì localStorage." }],
      "no-restricted-properties": ["error", { object: "window", property: "localStorage", message: "Dùng store/repository thay vì localStorage." }],
    },
  },
  {
    // nơi duy nhất được chạm localStorage
    files: ["src/lib/repository/**", "src/store/**"],
    rules: { "no-restricted-globals": "off", "no-restricted-properties": "off" },
  },
  {
    // shadcn/ui export cả component lẫn biến thể (buttonVariants…)
    files: ["src/components/ui/**"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["*.{js,ts}", "scripts/**/*.mjs"],
    languageOptions: { globals: globals.node },
  },
);
