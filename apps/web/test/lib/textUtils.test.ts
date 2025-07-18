import { describe, it } from "vitest";
import { shortenHash } from "../../src/lib/textUtils";

describe("textUtils", () => {
    it("should shorten hash", () => {
        expect(shortenHash("0x60a7048c3136293071605a4eaffef49923e981cd")).toBe(
            "0x60a704...e981cd",
        );
        expect(shortenHash("0x4ca2f6935200b9a782a78f408f640f17b29809d8")).toBe(
            "0x4ca2f6...9809d8",
        );
    });
});
