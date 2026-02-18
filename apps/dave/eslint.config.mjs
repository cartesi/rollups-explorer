import { nextJsConfig } from "eslint-config-cartesi/next-js";
import reactRefresh from "eslint-plugin-react-refresh";
import storybook from "eslint-plugin-storybook";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
    ...nextJsConfig,

    {
        files: ["**/*.{ts,tsx}"],
        ignores: ["coverage/**", ".turbo/**", "public/**", ".next/**"],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            "react-refresh": reactRefresh,
        },
        rules: {
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
            "@typescript-eslint/no-explicit-any": [
                "error",
                { fixToUnknown: true },
            ],
        },
    },
    ...storybook.configs["flat/recommended"],
];
