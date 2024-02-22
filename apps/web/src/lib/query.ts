/**
 * @typedef {Object} QueryReturn
 * @property {Array.<{msgSender_startsWith: string} | {application: {id_startsWith: string}}>} [OR]
 * @property {Array.<{application: {id_startsWith: string}} | {msgSender_startsWith?: string; transactionHash_startsWith?: string; index_eq?: number;}>} [AND]
 * @property {string} [transactionHash_startsWith]
 * @property {number} [index_eq]
 */
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
 * @param {string} input
 * @param {string} applicationId
 * @returns {QueryReturn}
 */
export const checkQuery = (
    input: string,
    applicationId: string = "",
): QueryReturn => {
    if (!input) return {};

    if (!applicationId) {
        if (input.startsWith("0x")) {
            if (input.length === 66) {
                return { transactionHash_startsWith: input };
            }
            return {
                OR: [
                    { msgSender_startsWith: input },
                    { application: { id_startsWith: input } },
                ],
            };
        }
        return { index_eq: parseInt(input) };
    }

    const common = { application: { id_startsWith: applicationId } };

    if (input.startsWith("0x")) {
        if (input.length === 66) {
            return { AND: [common, { transactionHash_startsWith: input }] };
        }
        return { AND: [common, { msgSender_startsWith: input }] };
    }
    return { AND: [common, { index_eq: parseInt(input) }] };
};
