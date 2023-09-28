import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.tsx"],
    format: ["esm", "cjs", "iife"],
    dts: true,
    external: ["react", "wagmi"],
    sourcemap: true,
});
