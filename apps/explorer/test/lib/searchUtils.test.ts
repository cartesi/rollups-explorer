import { describe, expect, it } from "vitest";
import {
    buildSearchLimit,
    buildSearchOffset,
    buildSearchSort,
    isNonNegativeSafeInteger,
} from "../../src/lib/searchUtils";

describe("searchUtils", () => {
    it.each(["0", "42", "9007199254740991"])(
        "accepts %s as a non-negative safe integer",
        (value) => {
            expect(isNonNegativeSafeInteger(value)).toBe(true);
        },
    );

    it.each(["-1", "1.5", "12abc", "9007199254740992"])(
        "rejects %s as a non-negative safe integer",
        (value) => {
            expect(isNonNegativeSafeInteger(value)).toBe(false);
        },
    );

    it("builds validated limits, sorting, and offsets", () => {
        expect(buildSearchLimit("30", [10, 30, 50] as const, 50)).toBe(30);
        expect(buildSearchLimit("30abc", [10, 30, 50] as const, 50)).toBe(
            50,
        );
        expect(buildSearchSort("DESC")).toEqual({ value: "desc" });
        expect(buildSearchSort(null)).toEqual({ value: "desc" });
        expect(buildSearchOffset("30")).toBe(30);
        expect(buildSearchOffset("30abc")).toBe(0);
    });
});