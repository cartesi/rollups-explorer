/**
 * Convert a string or string array to a boolean
 * @param value string or string array to convert to a boolean
 * @returns boolean or undefined
 */
export const toBoolean = (
    value: string | string[] | undefined,
    defaultValue?: boolean,
): boolean | undefined => {
    if (Array.isArray(value)) {
        return toBoolean(value[0], defaultValue);
    }
    return value === undefined ? defaultValue : value === "true";
};

/**
 * Convert a string or string array to a number
 * @param value string or string array to convert to a number
 * @returns
 */
export const toNumber = (
    value: string | string[] | undefined,
    defaultValue?: number,
): number | undefined => {
    if (Array.isArray(value)) {
        return toNumber(value[0]);
    }
    if (typeof value === "string") {
        return parseInt(value);
    }
    return defaultValue;
};
