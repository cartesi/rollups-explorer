import { describe, expect, it } from "vitest";
import { toRatio } from "../src/util";

describe("toRatio", () => {
    it("should divide bigints into a fraction", () => {
        expect(toRatio(1n, 4n)).toBe(0.25);
    });

    it("should keep precision beyond the safe integer range", () => {
        expect(toRatio(2n ** 90n, 2n ** 92n)).toBe(0.25);
    });

    it("should treat an empty domain as one", () => {
        expect(toRatio(0n, 0n)).toBe(0);
    });
});
