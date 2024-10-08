/**
 * @file Contains real samples from our graphQL API. This file should only hold this kind of data.
 */
import {
    SPECIFICATION_TRANSFER_NAME,
    SpecificationTransfer,
} from "../../../src/components/specification/types";
import { AbiType } from "abitype";

const chainId = "11155111";
const nonPortalRelatedInput = {
    id: `${chainId}-0xc65bf4b414cdb9e7625a33be0fc993d44030e89a-43`,
    application: {
        id: `${chainId}-0xc65bf4b414cdb9e7625a33be0fc993d44030e89a`,
        address: "0xc65bf4b414cdb9e7625a33be0fc993d44030e89a",
    },
    index: 43,
    payload:
        "0x227b5c226d6574686f645c223a5c22726f6c6c446963655c222c5c22646174615c223a7b5c2267616d6549645c223a5c2264386330346137622d653230372d346466622d613164322d6336346539643039633965355c222c5c22706c61796572416464726573735c223a5c223078633537633831663064653631363462366663383433613931373161323230643265636134626533345c227d7d22",
    msgSender: "0xc57c81f0de6164b6fc843a9171a220d2eca4be34",
    timestamp: "1716246048",
    transactionHash:
        "0x77f2fcd3eecbd067f3786be862af2fb0e89775dbf8314d169c0e4f09bb752f7a",
    erc20Deposit: null,
    chain: {
        id: chainId,
    },
} as const;

const singleERC1155DepositInput = {
    id: `${chainId}-0x4ca2f6935200b9a782a78f408f640f17b29809d8-802`,
    application: {
        id: `${chainId}-0x4ca2f6935200b9a782a78f408f640f17b29809d8`,
        address: "0x4ca2f6935200b9a782a78f408f640f17b29809d8",
    },
    index: 802,
    payload:
        "0x2960f4db2b0993ae5b59bc4a0f5ec7a1767e905ea074683b5be015f053b5dceb064c41fc9d11b6e5000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000640000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    msgSender: "0x7cfb0193ca87eb6e48056885e026552c3a941fc4",
    timestamp: "1713235704",
    transactionHash:
        "0x8f0a0db51c8bcd6edd9e9d44adb778339fd39b76388c93bdc170fe944e8caf39",
    erc20Deposit: null,
    chain: {
        id: chainId,
    },
} as const;

const batchERC1155DepositInput = {
    id: `${chainId}-0x4ca2f6935200b9a782a78f408f640f17b29809d8-805`,
    application: {
        id: `${chainId}-0x4ca2f6935200b9a782a78f408f640f17b29809d8`,
        address: "0x4ca2f6935200b9a782a78f408f640f17b29809d8",
    },
    index: 805,
    payload:
        "0xf08b9b4044441e43337c1ab6e941c4e59d5f73c8a074683b5be015f053b5dceb064c41fc9d11b6e500000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000001a00000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000028000000000000000000000000000000000000000000000000000000000000001e00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    msgSender: "0xedb53860a6b52bbb7561ad596416ee9965b055aa",
    timestamp: "1713420924",
    transactionHash:
        "0x9b7e68052231cbfae202b1902d2efc2b04ea0feac6dcba1397d4ad4f9b4af292",
    erc20Deposit: null,
    chain: {
        id: chainId,
    },
} as const;

const erc20DepositInput = {
    id: `${chainId}-0x4ca2f6935200b9a782a78f408f640f17b29809d8-788`,
    application: {
        id: `${chainId}-0x4ca2f6935200b9a782a78f408f640f17b29809d8`,
        address: "0x4ca2f6935200b9a782a78f408f640f17b29809d8",
    },
    index: 788,
    payload:
        "0x01dfc2e94264261a1f9d2a754cf20055bc6287ae5ba074683b5be015f053b5dceb064c41fc9d11b6e5000000000000000000000000000000000000000000000000000000174876e8003078",
    msgSender: "0x9c21aeb2093c32ddbc53eef24b873bdcd1ada1db",
    timestamp: "1708562892",
    transactionHash:
        "0x7f42dd070f9e431afbc82beab206a2df541606ca4179d5dd145952b2b507eadc",
    erc20Deposit: {
        id: "0x4ca2f6935200b9a782a78f408f640f17b29809d8-788",
        from: "0xa074683b5be015f053b5dceb064c41fc9d11b6e5",
        token: {
            id: "0xdfc2e94264261a1f9d2a754cf20055bc6287ae5b",
            name: "Cartesi Token",
            symbol: "CTSI",
            decimals: 18,
        },
        amount: "100000000000",
    },
    chain: {
        id: chainId,
    },
} as const;

const erc721DepositInput = {
    id: `${chainId}-0x4ca2f6935200b9a782a78f408f640f17b29809d8-782`,
    application: {
        id: `${chainId}-0x4ca2f6935200b9a782a78f408f640f17b29809d8`,
        address: "0x4ca2f6935200b9a782a78f408f640f17b29809d8",
    },
    index: 782,
    payload:
        "0x7a3cc9c0408887a030a0354330c36a9cd681aa7ea074683b5be015f053b5dceb064c41fc9d11b6e50000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000002307800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000023078000000000000000000000000000000000000000000000000000000000000",
    msgSender: "0x237f8dd094c0e47f4236f12b4fa01d6dae89fb87",
    timestamp: "1707710448",
    transactionHash:
        "0xcca56c45f486886a5d3669392440ef9127007226d9d456dd6da4ac9020322c34",
    erc20Deposit: null,
    chain: {
        id: chainId,
    },
} as const;

const dappAddressRelayInput = {
    id: `${chainId}-0x56d9baa89f84ebda027bca24950f61fc6dabd16e-0`,
    application: {
        id: `${chainId}-0x56d9baa89f84ebda027bca24950f61fc6dabd16e`,
        address: "0x56d9baa89f84ebda027bca24950f61fc6dabd16e",
    },
    index: 0,
    payload: "0x56d9baa89f84ebda027bca24950f61fc6dabd16e",
    msgSender: "0xf5de34d6bbc0446e2a45719e718efebaae179dae",
    timestamp: "1719249378",
    transactionHash:
        "0x0e9cc22122edd7d10eb75e9c3868845d0ba89afab66a987b5fabc84ba46c947f",
    erc20Deposit: null,
    chain: {
        id: chainId,
    },
} as const;

/**
 * Input response structure based on current graphQL queries
 */
export const inputResponses = {
    singleERC1155DepositInput,
    batchERC1155DepositInput,
    erc20DepositInput,
    erc721DepositInput,
    nonPortalRelatedInput,
    dappAddressRelayInput,
} as const;

/**
 * Specifications export
 */
export const defaultSpecificationExport: SpecificationTransfer = {
    version: 1,
    timestamp: new Date("2024-01-01 00:00:00").getTime(),
    name: SPECIFICATION_TRANSFER_NAME,
    specifications: [
        {
            conditionals: [
                {
                    conditions: [
                        {
                            field: "application.address",
                            operator: "equals",
                            value: "0x60a7048c3136293071605a4eaffef49923e981cc",
                        },
                    ],
                    logicalOperator: "or",
                },
            ],
            timestamp: 1724239104387,
            version: 1,
            name: "My first JSON ABI spec",
            id: "1724239104387",
            mode: "json_abi",
            abi: [
                {
                    name: "balanceOf",
                    type: "function",
                    stateMutability: "view",
                    inputs: [
                        {
                            type: "address",
                            name: "owner",
                        },
                    ],
                    outputs: [
                        {
                            type: "uint256",
                        },
                    ],
                },
            ],
        },
        {
            conditionals: [
                {
                    conditions: [
                        {
                            field: "application.address",
                            operator: "equals",
                            value: "0x60a7048c3136293071605a4eaffef49923e981cc",
                        },
                    ],
                    logicalOperator: "or",
                },
            ],
            timestamp: 1724239104388,
            version: 1,
            name: "My first ABI Params spec",
            id: "1724239104388",
            mode: "abi_params",
            abiParams: ["address to, uint256 amount, bool succ"],
            sliceInstructions: [
                {
                    from: 0,
                    to: 20,
                    name: "amount",
                    type: "unit" as AbiType,
                },
            ],
            sliceTarget: "amount",
        },
    ],
};
