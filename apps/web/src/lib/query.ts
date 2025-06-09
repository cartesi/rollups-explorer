import { isNotNilOrEmpty } from "ramda-adjunct";
import { isHash, isHex } from "viem";
import {
    InputWhereInput,
    RollupVersion,
} from "@cartesi/rollups-explorer-domain/explorer-types";

type QueryReturn = InputWhereInput;

/**
 *
 * @param {string} input
 * @param {string} appAddress
 * @param {string} chainId
 * @param {RollupVersion} appVersion
 * @returns {QueryReturn}
 */
export const checkQuery = (
    input: string,
    appAddress: string = "",
    chainId: string,
    appVersion?: RollupVersion,
): QueryReturn => {
    const chainQuery = { chain: { id_eq: chainId } };
    const versionQuery = isNotNilOrEmpty(appVersion)
        ? { rollupVersion_eq: appVersion }
        : {};

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
                return { transactionHash_eq: input, ...chainQuery };
            } else {
                return {
                    OR: [
                        { msgSender_startsWith: input, ...chainQuery },
                        {
                            application: { address_startsWith: input },
                            ...chainQuery,
                        },
                    ],
                };
            }
        } else {
            return { index_eq: parseInt(input), ...chainQuery };
        }
    }

    return chainQuery;
};
