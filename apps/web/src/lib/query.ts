import { isNotNilOrEmpty } from "ramda-adjunct";
import { isHash, isHex } from "viem";
import { InputWhereInput } from "../graphql/explorer/types";

type QueryReturn = InputWhereInput;

/**
 *
 * @param {string} input
 * @param {string} applicationId
 * @param {string} chainId
 * @returns {QueryReturn}
 */
export const checkQuery = (
    input: string,
    applicationId: string = "",
    chainId: string,
): QueryReturn => {
    const chainQuery = { chain: { id_eq: chainId } };
    if (isNotNilOrEmpty(applicationId)) {
        const byAppIdQuery: QueryReturn = {
            application: { address_startsWith: applicationId, ...chainQuery },
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
