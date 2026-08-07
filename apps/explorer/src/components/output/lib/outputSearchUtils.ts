import { cond, T } from "ramda";
import {
    buildSearchLimit as buildGenericSearchLimit,
    buildSearchOffset as buildGenericSearchOffset,
    buildSearchSort as buildGenericSearchSort,
} from "../../../lib/searchUtils";
import { limits, type Filter, type Sort } from "../OutputSearch";

type FilterQueryParams = {
    filterType: string | null;
    filterValue: string | null;
};

export const outputSearchUrlQueryName = {
    filterType: "ft",
    filterValue: "fv",
    sortValue: "sv",
    limitValue: "lv",
    offsetValue: "offset",
} as const;

const outputTypeFilter = cond<[params: FilterQueryParams], Filter>([
    [
        ({ filterValue }) => filterValue?.toLowerCase() === "notice",
        () => ({ type: { key: "outputType", value: "Notice" } }),
    ],
    [
        ({ filterValue }) => filterValue?.toLowerCase() === "voucher",
        () => ({ type: { key: "outputType", value: "Voucher" } }),
    ],
    [
        ({ filterValue }) =>
            filterValue?.toLowerCase() === "delegatecallvoucher",
        () => ({
            type: { key: "outputType", value: "DelegateCallVoucher" },
        }),
    ],
    [T, () => ({})],
]);

/**
 * Builds a filter object based on the provided query parameters.
 * It checks the filter type and value to determine the appropriate filter to apply.
 * If the filter type is "output-type", and generate the appropriate {Filter} object.
 * @param {FilterQueryParams} params - The url query parameters containing the filter type and value.
 * @returns {Filter} The constructed filter object based on the query parameters.
 */
export const buildSearchFilter = cond<[FilterQueryParams], Filter>([
    [
        ({ filterType }) => filterType?.toLowerCase() === "outputtype",
        outputTypeFilter,
    ],
    [T, () => ({})],
]);

/**
 * Builds a limit value based on the provided query parameter.
 * It ensures the limit is within the allowed range.
 * @param {string | null} limitVal - The url query parameter containing the limit value.
 * @returns {number} The constructed limit value based on the query parameter.
 */
export const buildSearchLimit = (limitVal: string | null) => {
    return buildGenericSearchLimit(limitVal, limits, 50);
};

/**
 * Builds a sort object based on the provided query parameter.
 * It ensures the sort value is either "asc" or "desc".
 * @param {string | null} sortVal - The url query parameter containing the sort value.
 * @returns {Sort} The constructed sort object based on the query parameter.
 */
export const buildSearchSort = (sortVal: string | null): Sort => {
    return buildGenericSearchSort(sortVal);
};

/**
 * Builds an offset value based on the provided query parameter.
 * It ensures the offset is a non-negative integer.
 * @param {string | null} offsetVal - The url query parameter containing the offset value.
 * @returns {number} The constructed offset value based on the query parameter.
 */
export const buildSearchOffset = (offsetVal: string | null) => {
    return buildGenericSearchOffset(offsetVal);
};
