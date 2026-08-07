import { describe, expect, it } from "vitest";
import {
    buildWithdrawalSearchAccountIndex,
    buildWithdrawalSearchLimit,
    buildWithdrawalSearchOffset,
    buildWithdrawalSearchSort,
} from "../../../../src/components/withdrawal/lib/withdrawalSearchUtils";

describe("withdrawalSearchUtils", () => {
    describe("buildWithdrawalSearchAccountIndex", () => {
        it("returns a valid non-negative account index as a bigint", () => {
            expect(buildWithdrawalSearchAccountIndex("42")).toBe(42n);
        });

        it.each([null, "", "-1", "1.5", "account", "9007199254740992"])(
            "returns undefined for an invalid account index of %s",
            (accountIndex) => {
                expect(buildWithdrawalSearchAccountIndex(accountIndex)).toBe(
                    undefined,
                );
            },
        );
    });

    describe("buildWithdrawalSearchLimit", () => {
        it("returns an allowed limit", () => {
            expect(buildWithdrawalSearchLimit("30")).toBe(30);
        });

        it.each([null, "", "20", "1.5", "limit"])(
            "falls back to the default limit for %s",
            (limitValue) => {
                expect(buildWithdrawalSearchLimit(limitValue)).toBe(50);
            },
        );
    });

    describe("buildWithdrawalSearchSort", () => {
        it("defaults to descending order and accepts ascending order", () => {
            expect(buildWithdrawalSearchSort(null)).toEqual({ value: "desc" });
            expect(buildWithdrawalSearchSort("asc")).toEqual({ value: "asc" });
        });
    });

    describe("buildWithdrawalSearchOffset", () => {
        it("returns a valid non-negative offset", () => {
            expect(buildWithdrawalSearchOffset("30")).toBe(30);
        });

        it.each([null, "", "-1", "1.5", "offset"])(
            "falls back to zero for %s",
            (offsetValue) => {
                expect(buildWithdrawalSearchOffset(offsetValue)).toBe(0);
            },
        );
    });
});
