import { describe, expect, test } from "vitest";
import { shortenHash } from "../../src/lib/textUtils";

describe("shortenHash function", () => {
    test("should return the original value if is not a valid hash", () => {
        expect(shortenHash("not-a-hash")).toBe("not-a-hash");
    });

    test("should keep prefix and suffix", () => {
        expect(
            shortenHash(
                "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
            ),
        ).toBe("0x123456...abcdef");
    });
});
