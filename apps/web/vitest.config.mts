import react from "@vitejs/plugin-react";
import { defineConfig, UserConfig } from "vitest/config";

export default defineConfig({
    plugins: [react()],
    test: {
        exclude: ["e2e/**"],
        globals: true,
        environment: "jsdom",
        setupFiles: "vitest-setup.ts",
        coverage: {
            reporter: ["text", "lcov"],
        },
    },
} as UserConfig);
