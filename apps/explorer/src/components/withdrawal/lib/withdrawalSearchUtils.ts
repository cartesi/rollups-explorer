import {
    buildSearchLimit,
    buildSearchOffset,
    buildSearchSort,
    isNonNegativeSafeInteger,
    type SearchSort,
} from "../../../lib/searchUtils";

export const withdrawalSearchUrlQueryName = {
    accountIndex: "ai",
    sortValue: "sv",
    limitValue: "lv",
    offsetValue: "offset",
} as const;

export const withdrawalSearchLimits = [10, 30, 50] as const;

export type WithdrawalSearchLimit = (typeof withdrawalSearchLimits)[number];

export type WithdrawalSearchSort = SearchSort;

export const buildWithdrawalSearchAccountIndex = (
    accountIndex: string | null,
) => {
    if (!accountIndex) return undefined;

    if (!isNonNegativeSafeInteger(accountIndex)) return undefined;

    return BigInt(accountIndex);
};

export const buildWithdrawalSearchLimit = (
    limitValue: string | null,
): WithdrawalSearchLimit => {
    return buildSearchLimit(limitValue, withdrawalSearchLimits, 50);
};

export const buildWithdrawalSearchSort = (
    sortValue: string | null,
): WithdrawalSearchSort => {
    return buildSearchSort(sortValue);
};

export const buildWithdrawalSearchOffset = (offsetValue: string | null) => {
    return buildSearchOffset(offsetValue);
};
