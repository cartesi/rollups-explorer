import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/**/**.{ts,tsx}"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    sourcemap: true,
    esbuildOptions(options, context) {
        options.banner = {
            js: '"use client";',
        };
    },
});
