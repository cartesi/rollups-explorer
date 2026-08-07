import { isEmpty } from "ramda";

export const withdrawalSearchUrlQueryName = {
    accountIndex: "ai",
    sortValue: "sv",
    limitValue: "lv",
    offsetValue: "offset",
} as const;

export const withdrawalSearchLimits = [10, 30, 50] as const;

export type WithdrawalSearchLimit = (typeof withdrawalSearchLimits)[number];

export type WithdrawalSearchSort = {
    value: "asc" | "desc";
};

const isNonNegativeSafeInteger = (value: string) => {
    if (!/^\d+$/.test(value)) return false;

    const numberValue = Number(value);
    return Number.isSafeInteger(numberValue);
};

export const buildWithdrawalSearchAccountIndex = (
    accountIndex: string | null,
) => {
    if (!accountIndex || isEmpty(accountIndex)) return undefined;

    if (!isNonNegativeSafeInteger(accountIndex)) return undefined;

    return BigInt(accountIndex);
};

export const buildWithdrawalSearchLimit = (
    limitValue: string | null,
): WithdrawalSearchLimit => {
    if (!limitValue || isEmpty(limitValue)) return 50;
    if (!isNonNegativeSafeInteger(limitValue)) return 50;

    const limit = Number(limitValue);
    return withdrawalSearchLimits.includes(limit as WithdrawalSearchLimit)
        ? (limit as WithdrawalSearchLimit)
        : 50;
};

export const buildWithdrawalSearchSort = (
    sortValue: string | null,
): WithdrawalSearchSort => {
    if (!sortValue || isEmpty(sortValue)) return { value: "desc" };

    return sortValue.toLowerCase() === "desc"
        ? { value: "desc" }
        : { value: "asc" };
};

export const buildWithdrawalSearchOffset = (offsetValue: string | null) => {
    if (!offsetValue || isEmpty(offsetValue)) return 0;

    if (!isNonNegativeSafeInteger(offsetValue)) return 0;

    return Number(offsetValue);
};
