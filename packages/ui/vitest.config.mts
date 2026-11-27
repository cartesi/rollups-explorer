import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: ["./vitest-setup.ts"],
        testTimeout: 10_000,
        coverage: {
            reporter: ["text", "lcov"],
            ignoreEmptyLines: true,
        },
    },
});
