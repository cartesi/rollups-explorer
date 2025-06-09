import { InputItemFragment } from "@cartesi/rollups-explorer-domain/explorer-operations";
import { RollupVersion } from "@cartesi/rollups-explorer-domain/explorer-types";
import { VoucherEdge } from "@cartesi/rollups-explorer-domain/rollups-types";

export const chainId = "11155111";
/**
 * A list of applications with only id property
 */
export const applicationsSample = [
    {
        address: "0x60a7048c3136293071605a4eaffef49923e981cc",
        id: `${chainId}-0x60a7048c3136293071605a4eaffef49923e981cc`,
        rollupVersion: RollupVersion.V1,
    },
    {
        address: "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c",
        id: `${chainId}-0x70ac08179605af2d9e75782b8decdd3c22aa4d0c`,
        rollupVersion: RollupVersion.V1,
    },
    {
        address: "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3",
        id: `${chainId}-0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3`,
        rollupVersion: RollupVersion.V1,
    },
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
                } as VoucherEdge,
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

export const inputDetailsSampleV2 = {
    ...structuredClone(inputDetailsSample),
};

export const inputDetailsSampleForPagingV2 = {
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
                        payload:
                            "0xa9059cbb0000000000000000000000000769e15f8d7042969aeb78e73b54192b3c4ec8bc00000000000000000000000000000000000000000000000000000000000aae60",
                        destination:
                            "0x036cbd53842c5426634e7929541ec2318f3dcf7e",
                        proof: {
                            outputIndex: 0n,
                            outputHashesSiblings: [],
                        },
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
export const inputSample: InputItemFragment = {
    id: "0x721be000f6054b5e0e57aaab791015b53f0a18f4-0",
    application: {
        id: `${chainId}-0x721be000f6054b5e0e57aaab791015b53f0a18f4`,
        address: "0x721be000f6054b5e0e57aaab791015b53f0a18f4",
        rollupVersion: RollupVersion.V1,
    },
    index: 0,
    payload: "0x6a6f696e47616d65",
    msgSender: "0xffdbe43d4c855bf7e0f105c400a50857f53ab044",
    timestamp: "1699239756",
    transactionHash:
        "0x6ce72329f44a9548753170b62db6f43f40911f0a3149cdc41a445e03a433e87b",
    erc20Deposit: null,
    chain: {
        id: chainId,
    },
};

export const inputSampleEtherDeposit: InputItemFragment = {
    id: "11155111-0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e-132",
    application: {
        id: "11155111-0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e",
        address: "0xab7528bb862fb57e8a2bcd567a2e929a0be56a5e",
        rollupVersion: RollupVersion.V1,
    },
    chain: { id: "11155111" },
    index: 132,
    payload:
        "0xcc42e700ae461bdf5b560e781110a965a8d4393500000000000000000000000000000000000000000000000000000000000000004465706f7369746564202830292065746865722e",
    msgSender: "0xffdbe43d4c855bf7e0f105c400a50857f53ab044",
    timestamp: "1729726392",
    transactionHash:
        "0x426a89ff66e1bbbd22947ad43e2efe54c68b842d59dd041c28a0497ac7ba96b8",
    erc20Deposit: null,
};
