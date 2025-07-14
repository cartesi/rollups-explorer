import { isNotNilOrEmpty } from "ramda-adjunct";
import { isHash, isHex } from "viem";
import {
    ApplicationWhereInput,
    InputWhereInput,
    RollupVersion,
} from "@cartesi/rollups-explorer-domain/explorer-types";

type QueryReturn = InputWhereInput;

/**
 *
 * @param {string} input
 * @param {string} appAddress
 * @param {string} chainId
 * @param {RollupVersion[]} versions
 * @returns {QueryReturn}
 */
export const checkQuery = (
    input: string,
    appAddress: string = "",
    chainId: string,
    versions?: RollupVersion[],
): QueryReturn => {
    const chainQuery: InputWhereInput = { chain: { id_eq: chainId } };
    const hasVersions = isNotNilOrEmpty(versions);
    const versionQuery = hasVersions ? { rollupVersion_in: versions } : {};

    if (isNotNilOrEmpty(appAddress)) {
        const byAppIdQuery: QueryReturn = {
            application: {
                address_startsWith: appAddress,
                ...chainQuery,
                ...versionQuery,
            },
        };

        if (input) {
            const AND: QueryReturn[] = [byAppIdQuery];

            if (isHex(input)) {
                if (isHash(input)) {
                    AND.push({ transactionHash_eq: input, ...chainQuery });
                } else {
                    AND.push({ msgSender_startsWith: input, ...chainQuery });
                }
            } else {
                AND.push({ index_eq: parseInt(input), ...chainQuery });
            }
            return { AND };
        }
        return byAppIdQuery;
    } else if (input) {
        if (isHex(input)) {
            if (isHash(input)) {
                const hashInputQuery: InputWhereInput = {
                    transactionHash_eq: input,
                    ...chainQuery,
                };

                if (hasVersions) {
                    hashInputQuery.application = {
                        ...versionQuery,
                    };
                }

                return hashInputQuery;
            } else {
                const inputQuery: InputWhereInput = {
                    msgSender_startsWith: input,
                    ...chainQuery,
                };

                if (hasVersions) {
                    inputQuery.application = {
                        ...versionQuery,
                    };
                }

                return {
                    OR: [
                        inputQuery,
                        {
                            application: {
                                address_startsWith: input,
                                ...versionQuery,
                            },
                            ...chainQuery,
                        },
                    ],
                };
            }
        } else {
            return {
                index_eq: parseInt(input),
                ...chainQuery,
            };
        }
    }

    if (hasVersions) {
        const byAppVersionQuery: QueryReturn = {
            application: {
                ...versionQuery,
            },
        };

        chainQuery.AND = [byAppVersionQuery];
    }

    return chainQuery;
};

interface CheckApplicationsQueryParams {
    chainId: string;
    address?: string;
    versions?: RollupVersion[];
}

/**
 * @description Builds an applications' query
 * @param params
 */
export const checkApplicationsQuery = (
    params: CheckApplicationsQueryParams,
) => {
    const { chainId, address, versions } = params;
    const versionQuery = isNotNilOrEmpty(versions)
        ? { rollupVersion_in: versions }
        : {};
    const chainQuery: ApplicationWhereInput = {
        chain: { id_eq: chainId },
        ...versionQuery,
    };

    if (isNotNilOrEmpty(address)) {
        return {
            ...chainQuery,
            address_startsWith: address,
            OR: [
                {
                    owner_startsWith: address,
                    ...versionQuery,
                },
            ],
        };
    }

    return chainQuery;
};
