import { afterEach, describe, expect, test, vi } from "vitest";
import { getConfiguredMockEnabled } from "../../src/lib/getConfigMockEnabled";

describe("getConfiguredMockEnabled function", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    test("should return true when MOCK_ENABLED is true", () => {
        vi.stubEnv("MOCK_ENABLED", "true");
        vi.stubEnv("NEXT_PUBLIC_MOCK_ENABLED", "false");

        expect(getConfiguredMockEnabled()).toBe(true);
    });

    test("should fallback to NEXT_PUBLIC_MOCK_ENABLED", () => {
        vi.stubEnv("MOCK_ENABLED", "");
        vi.stubEnv("NEXT_PUBLIC_MOCK_ENABLED", "true");

        expect(getConfiguredMockEnabled()).toBe(true);
    });

    test("should return false by default", () => {
        expect(getConfiguredMockEnabled()).toBe(false);
    });
});
