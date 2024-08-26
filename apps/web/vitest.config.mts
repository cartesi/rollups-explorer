import react from "@vitejs/plugin-react";
import { defineConfig, UserConfig } from "vitest/config";

export default defineConfig({
    plugins: [react()],
    test: {
        exclude: ["e2e/**", "node_modules/**"],
        globals: true,
        environment: "happy-dom",
        setupFiles: "vitest-setup.ts",
        coverage: {
            reporter: ["text", "lcov"],
            exclude: [
                "**/graphql/**",
                "**/.next/**",
                "**/e2e/**",
                "**/test/**",
                "**/app/**",
                "**/playwright-report/**",
                "*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
            ],
        },
        server: {
            deps: {
                inline: ["antd", "@ant-design", "@ant-design/web3-icons"],
            },
        },
    },
} as UserConfig);
