import { afterEach, describe, expect, test, vi } from "vitest";
import { getConfiguredIsContainer } from "../../src/lib/getConfigIsContainer";

describe("getConfiguredIsContainer function", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    test("should return true when NEXT_PUBLIC_IS_CONTAINER is true", () => {
        vi.stubEnv("NEXT_PUBLIC_IS_CONTAINER", "true");

        expect(getConfiguredIsContainer()).toBe(true);
    });

    test("should handle mixed case values", () => {
        vi.stubEnv("NEXT_PUBLIC_IS_CONTAINER", "TrUe");

        expect(getConfiguredIsContainer()).toBe(true);
    });

    test("should return false by default", () => {
        expect(getConfiguredIsContainer()).toBe(false);
    });
});
