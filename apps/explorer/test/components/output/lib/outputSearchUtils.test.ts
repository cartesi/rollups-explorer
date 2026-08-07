import { describe, expect, it } from "vitest";
import {
    buildSearchFilter,
    buildSearchLimit,
    buildSearchOffset,
    buildSearchSort,
} from "../../../../src/components/output/lib/outputSearchUtils";

describe("outputSearchUtils", () => {
    describe("buildSearchFilter", () => {
        it("builds an output-type filter for valid output types", () => {
            expect(
                buildSearchFilter({
                    filterType: "outputType",
                    filterValue: "voucher",
                }),
            ).toEqual({ type: { key: "outputType", value: "Voucher" } });
        });

        it("returns an empty filter for unknown types and values", () => {
            expect(
                buildSearchFilter({
                    filterType: "inputIndex",
                    filterValue: "Voucher",
                }),
            ).toEqual({});
            expect(
                buildSearchFilter({
                    filterType: "outputType",
                    filterValue: "Report",
                }),
            ).toEqual({});
        });
    });

    describe("buildSearchLimit", () => {
        it("returns allowed limits", () => {
            expect(buildSearchLimit("30")).toBe(30);
        });

        it.each([null, "", "20", "30abc", "1.5", "limit"])(
            "falls back to the default limit for %s",
            (limitValue) => {
                expect(buildSearchLimit(limitValue)).toBe(50);
            },
        );
    });

    describe("buildSearchSort", () => {
        it("defaults to descending and supports case-insensitive sorting", () => {
            expect(buildSearchSort(null)).toEqual({ value: "desc" });
            expect(buildSearchSort("ASC")).toEqual({ value: "asc" });
            expect(buildSearchSort("DESC")).toEqual({ value: "desc" });
        });
    });

    describe("buildSearchOffset", () => {
        it("returns non-negative parsed offsets", () => {
            expect(buildSearchOffset("30")).toBe(30);
            expect(buildSearchOffset("-1")).toBe(0);
        });

        it.each([
            null,
            "",
            "-1",
            "1.5",
            "30abc",
            "9007199254740992",
            "invalid",
        ])("falls back to zero for %s", (offsetValue) => {
            expect(buildSearchOffset(offsetValue)).toBe(0);
        });
    });
});
