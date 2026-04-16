import { describe, expect, test } from "vitest";
import { shortenAddress, shortenHash } from "../../src/lib/textUtils";

describe("Text Utils", () => {
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

    describe("shortenAddress function", () => {
        test("should generate a short version of an address by keeping prefix and suffix", () => {
            expect(
                shortenAddress("0x3943318D1174AF9f209681c703c520162823c9B1"),
            ).toBe("0x394331...23c9B1");
        });

        test("should return the original value if it is not a valid address", () => {
            expect(shortenAddress("not-a-valid-address")).toBe(
                "not-a-valid-address",
            );
        });
    });
});
