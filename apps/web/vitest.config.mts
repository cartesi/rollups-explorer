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
            exclude: ["**/graphql/**", "**/app/**"],
            include: ["**/src"],
            ignoreEmptyLines: true,
        },
    },
} as UserConfig);
