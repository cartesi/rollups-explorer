import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/**/**.{ts,tsx}"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    sourcemap: true,
});
