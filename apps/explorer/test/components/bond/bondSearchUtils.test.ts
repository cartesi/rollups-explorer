import { describe, expect, it } from "vitest";
import {
    buildBondSearchEpoch,
    buildBondSearchLimit,
    buildBondSearchOffset,
} from "../../../src/components/bond/lib/bondSearchUtils";

describe("bondSearchUtils", () => {
    it("should parse a non negative epoch", () => {
        expect(buildBondSearchEpoch("12")).toBe(12n);
        expect(buildBondSearchEpoch("-1")).toBeUndefined();
        expect(buildBondSearchEpoch(null)).toBeUndefined();
    });

    it("should only accept the supported limits", () => {
        expect(buildBondSearchLimit("30")).toBe(30);
        expect(buildBondSearchLimit("7")).toBe(50);
    });

    it("should default the offset to zero", () => {
        expect(buildBondSearchOffset("40")).toBe(40);
        expect(buildBondSearchOffset("x")).toBe(0);
    });
});
