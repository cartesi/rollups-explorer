import { describe, it } from "vitest";
import { shortenHash, splitString } from "../../src/lib/textUtils";

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

describe("splitString", () => {
    it("should split string", () => {
        expect(splitString("v1,v2")).toEqual(["v1", "v2"]);
        expect(splitString("v1/v2", "/")).toEqual(["v1", "v2"]);
        expect(splitString("v1xv2", "x")).toEqual(["v1", "v2"]);
    });
});
