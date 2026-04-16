import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        dir: "./test",
        exclude: ["node_modules/**"],
        globals: true,
        environment: "happy-dom",
        setupFiles: ["./vitest.setup.ts"],
        coverage: {
            provider: "v8",
            reporter: ["text", "lcov"],
            exclude: [
                "**/generated/**",
                "**/app/**",
                "**/providers/localdata/**",
                "**/stories/**",
                "**.stories.*",
            ],
            include: ["**/src"],
        },
    },
});
