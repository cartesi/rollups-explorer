import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.tsx"],
    format: ["esm", "cjs"],
    dts: true,
    external: ["react", "@mantine/core", "@mantine/hooks"],
    sourcemap: true,
    esbuildOptions(options, context) {
        options.banner = {
            js: '"use client";',
        };
    },
});
