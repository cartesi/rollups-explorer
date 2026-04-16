import { afterEach, describe, expect, test, vi } from "vitest";
import { getConfiguredDebugEnabled } from "../../src/lib/getConfigDebugEnabled";

describe("getConfiguredDebugEnabled function", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    test("should return true when DEBUG_ENABLED is true", () => {
        vi.stubEnv("DEBUG_ENABLED", "true");
        vi.stubEnv("NEXT_PUBLIC_DEBUG_ENABLED", "false");

        expect(getConfiguredDebugEnabled()).toBe(true);
    });

    test("should fallback to NEXT_PUBLIC_DEBUG_ENABLED", () => {
        vi.stubEnv("DEBUG_ENABLED", "");
        vi.stubEnv("NEXT_PUBLIC_DEBUG_ENABLED", "true");

        expect(getConfiguredDebugEnabled()).toBe(true);
    });

    test("should return false when value is not true", () => {
        vi.stubEnv("DEBUG_ENABLED", "false");

        expect(getConfiguredDebugEnabled()).toBe(false);
    });

    test("should return false when neither env var are set", () => {
        vi.stubEnv("DEBUG_ENABLED", undefined as unknown as string);
        vi.stubEnv("NEXT_PUBLIC_DEBUG_ENABLED", undefined as unknown as string);

        expect(getConfiguredDebugEnabled()).toBe(false);
    });
});
