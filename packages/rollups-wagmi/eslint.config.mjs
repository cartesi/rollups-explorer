import { config } from "eslint-config-cartesi/base";

/** @type {import("eslint").Linter.Config[]} */
export default [
    ...config,
    { files: ["*.{js,mjs,cjs,ts}"] },
    { ignores: ["dist/**", "node_modules", "abi", "src"] },
    {
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_" },
            ],
        },
    },
];
