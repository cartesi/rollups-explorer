import {
    buildSearchLimit,
    buildSearchOffset,
    isNonNegativeSafeInteger,
} from "../../../lib/searchUtils";

export const bondSearchUrlQueryName = {
    epoch: "epoch",
    limitValue: "lv",
    offsetValue: "offset",
} as const;

export const bondSearchLimits = [10, 30, 50] as const;

export type BondSearchLimit = (typeof bondSearchLimits)[number];

export const buildBondSearchEpoch = (epoch: string | null) => {
    if (!epoch || !isNonNegativeSafeInteger(epoch)) return undefined;

    return BigInt(epoch);
};

export const buildBondSearchLimit = (
    limitValue: string | null,
): BondSearchLimit => buildSearchLimit(limitValue, bondSearchLimits, 50);

export const buildBondSearchOffset = (offsetValue: string | null) =>
    buildSearchOffset(offsetValue);
