export type SearchSort = {
    value: "asc" | "desc";
};

export const isNonNegativeSafeInteger = (value: string) => {
    if (!/^\d+$/.test(value)) return false;

    return Number.isSafeInteger(Number(value));
};

export const buildSearchLimit = <Limit extends number>(
    limitValue: string | null,
    limits: readonly Limit[],
    defaultLimit: Limit,
): Limit => {
    if (!limitValue || !isNonNegativeSafeInteger(limitValue)) {
        return defaultLimit;
    }

    const limit = Number(limitValue);
    return limits.find((allowedLimit) => allowedLimit === limit) ?? defaultLimit;
};

export const buildSearchSort = (sortValue: string | null): SearchSort => {
    if (!sortValue) return { value: "desc" };

    return sortValue.toLowerCase() === "desc"
        ? { value: "desc" }
        : { value: "asc" };
};

export const buildSearchOffset = (offsetValue: string | null) => {
    if (!offsetValue || !isNonNegativeSafeInteger(offsetValue)) return 0;

    return Number(offsetValue);
};