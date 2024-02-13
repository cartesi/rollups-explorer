/**
 * A list of applications with only id property
 */
export const applicationsSample = [
    { id: "0x60a7048c3136293071605a4eaffef49923e981cc" },
    { id: "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c" },
    { id: "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3" },
];

/**
 * CheckStatus valid response
 */
export const checkStatusSample = {
    inputs: {
        totalCount: 775,
    },
    vouchers: {
        totalCount: 1,
    },
    reports: {
        totalCount: 775,
    },
    notices: {
        totalCount: 0,
    },
};

/**
 * InputDetails query response sample
 */
export const inputDetailsSample = {
    input: {
        vouchers: {
            totalCount: 0,
            edges: [],
            pageInfo: {
                startCursor: null,
                endCursor: null,
                hasNextPage: false,
                hasPreviousPage: false,
            },
        },
        notices: {
            totalCount: 0,
            edges: [],
            pageInfo: {
                startCursor: null,
                endCursor: null,
                hasNextPage: false,
                hasPreviousPage: false,
            },
        },
        reports: {
            totalCount: 1,
            edges: [
                {
                    node: {
                        index: 0,
                        payload: "0x5168342b",
                    },
                    cursor: "MA==",
                },
            ],
            pageInfo: {
                startCursor: "MA==",
                endCursor: "MA==",
                hasNextPage: false,
                hasPreviousPage: false,
            },
        },
    },
};

/**
 * InputDetails query response sample to display paging capabilities
 */
export const inputDetailsSampleForPaging = {
    input: {
        vouchers: {
            totalCount: 3,
            edges: [
                {
                    node: {
                        index: 0,
                        input: {
                            index: 0,
                        },
                        payload: "0x5168342b",
                    },
                    cursor: "MA==",
                },
            ],
            pageInfo: {
                startCursor: null,
                endCursor: null,
                hasNextPage: false,
                hasPreviousPage: false,
            },
        },
        notices: {
            totalCount: 2,
            edges: [
                {
                    node: {
                        index: 0,
                        payload: "0x5168342b",
                    },
                    cursor: "MA==",
                },
            ],
            pageInfo: {
                startCursor: null,
                endCursor: null,
                hasNextPage: false,
                hasPreviousPage: false,
            },
        },
        reports: {
            totalCount: 4,
            edges: [
                {
                    node: {
                        index: 0,
                        payload: "0x5168342b",
                    },
                    cursor: "MA==",
                },
            ],
            pageInfo: {
                startCursor: "MA==",
                endCursor: "MA==",
                hasNextPage: false,
                hasPreviousPage: false,
            },
        },
    },
};

/**
 * A single full featured input.
 */
export const inputSample = {
    id: "0x721be000f6054b5e0e57aaab791015b53f0a18f4-0",
    application: {
        id: "0x721be000f6054b5e0e57aaab791015b53f0a18f4",
    },
    index: 0,
    payload: "0x6a6f696e47616d65",
    msgSender: "0xffdbe43d4c855bf7e0f105c400a50857f53ab044",
    timestamp: "1699239756",
    transactionHash:
        "0x6ce72329f44a9548753170b62db6f43f40911f0a3149cdc41a445e03a433e87b",
    erc20Deposit: null,
};
