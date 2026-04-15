import { describe, expect, test } from "vitest";
import { checkURL } from "../../src/lib/urlUtils";

describe("checkURL function", () => {
    test("should validate proper URLs", () => {
        const result = checkURL("https://rollups.cartesi.io/path");

        expect(result.validUrl).toBe(true);
        if (result.validUrl) {
            expect(result.protocol).toBe("https:");
            expect(result.urlObject.hostname).toBe("rollups.cartesi.io");
        }
    });

    test("should return invalid result for malformed URLs", () => {
        const result = checkURL("not-a-url");

        expect(result.validUrl).toBe(false);
        if (!result.validUrl) {
            expect(result.url).toBe("not-a-url");
            expect(result.error).toBeInstanceOf(TypeError);
            expect(result.error.message).toBe("Invalid URL");
        }
    });
});
