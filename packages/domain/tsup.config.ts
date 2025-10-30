import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/**/**.{ts,tsx}"],
    format: ["esm", "cjs"],
    external: ["graphql", "graphql-tag"],
    dts: true,
    clean: true,
    sourcemap: true,
});
