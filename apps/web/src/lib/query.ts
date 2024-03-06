import { isHash, isHex } from "viem";
import { InputWhereInput } from "../graphql/explorer/types";

type QueryReturn = InputWhereInput;

/**
 *
 * @param {string} input
 * @param {string} applicationId
 * @returns {QueryReturn}
 */
export const checkQuery = (
    input: string,
    applicationId: string = "",
): QueryReturn => {
    if (applicationId) {
        const byAppIdQuery: QueryReturn = {
            application: { id_startsWith: applicationId },
        };

        if (input) {
            const AND: QueryReturn[] = [byAppIdQuery];

            if (isHex(input)) {
                if (isHash(input)) {
                    AND.push({ transactionHash_eq: input });
                } else {
                    AND.push({ msgSender_startsWith: input });
                }
            } else {
                AND.push({ index_eq: parseInt(input) });
            }
            return { AND };
        }
        return byAppIdQuery;
    } else if (input) {
        if (isHex(input)) {
            if (isHash(input)) {
                return { transactionHash_eq: input };
            } else {
                return {
                    OR: [
                        { msgSender_startsWith: input },
                        { application: { id_startsWith: input } },
                    ],
                };
            }
        } else {
            return { index_eq: parseInt(input) };
        }
    }

    return {};
};
