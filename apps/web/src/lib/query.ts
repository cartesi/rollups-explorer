import { isAddress } from "viem";

// Define types for the return values
type QueryReturn = {
    OR?: [
        { msgSender_startsWith: string },
        { application: { id_startsWith: string } },
    ];
    AND?: [
        { application: { id_startsWith: string } },
        {
            msgSender_startsWith?: string;
            transactionHash_startsWith?: string;
            index_eq?: number;
        },
    ];
    transactionHash_startsWith?: string;
    index_eq?: number;
};

/**
 *
 * @param input
 * @param applicationId
 * @returns
 */

export const checkQuery = (
    input: string,
    applicationId: string = "",
): QueryReturn => {
    if (!input) return {};

    if (!applicationId) {
        if (isAddress(input)) {
            return {
                OR: [
                    { msgSender_startsWith: input },
                    { application: { id_startsWith: input } },
                ],
            };
        }
        if (input.startsWith("0x") && input.length === 66) {
            return { transactionHash_startsWith: input };
        }
        return { index_eq: parseInt(input) };
    }

    const common = { application: { id_startsWith: applicationId } };

    if (isAddress(input)) {
        return { AND: [common, { msgSender_startsWith: input }] };
    }
    if (input.startsWith("0x") && input.length === 66) {
        return { AND: [common, { transactionHash_startsWith: input }] };
    }
    return { AND: [common, { index_eq: parseInt(input) }] };
};
