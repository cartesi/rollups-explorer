/**
 * A group of specifications defined by the system. Mostly related to Cartesi Portals.
 * They can't be deleted or edited by the user.
 */
import {
    dAppAddressRelayConfig,
    erc1155BatchPortalConfig,
    erc1155SinglePortalConfig,
    erc20PortalConfig,
    erc721PortalConfig,
} from "@cartesi/rollups-wagmi";
import { Specification } from "./types";

const ERC1155SinglePortalSpec: Specification = {
    id: "1a22a018-293c-4973-a355-d73648872c03",
    mode: "abi_params",
    name: `ERC-1155 Single Portal @cartesi/rollups@1.x`,
    sliceInstructions: [
        { from: 0, to: 20, name: "tokenAddress" },
        { from: 20, to: 40, name: "from" },
        { from: 40, to: 72, name: "tokenId", type: "uint" },
        { from: 72, to: 104, name: "amount", type: "uint" },
    ],
    conditionals: [
        {
            logicalOperator: "or",
            conditions: [
                {
                    field: "msgSender",
                    operator: "equals",
                    value: erc1155SinglePortalConfig.address.toLowerCase(),
                },
            ],
        },
    ],
    abiParams: [],
    version: 1,
} as const;

const ERC1155BatchPortalSpec: Specification = {
    id: "ccae05b0-e9de-43db-a7a8-033fa55fee0a",
    mode: "abi_params",
    name: "ERC-1155 Batch Portal @cartesi/rollups@1.x",
    abiParams: [
        "uint[] tokenIds, uint[] amounts, bytes baseLayer, bytes execLayer",
    ],
    sliceInstructions: [
        {
            from: 0,
            to: 20,
            name: "tokenAddress",
        },
        {
            from: 20,
            to: 40,
            name: "from",
        },
        {
            from: 40,
            name: "data",
        },
    ],
    sliceTarget: "data",
    conditionals: [
        {
            logicalOperator: "or",
            conditions: [
                {
                    field: "msgSender",
                    operator: "equals",
                    value: erc1155BatchPortalConfig.address.toLowerCase(),
                },
            ],
        },
    ],
    version: 1,
} as const;

const ERC20PortalSpec: Specification = {
    id: "46c084dd-4738-4cff-9303-4ef9e562985d",
    mode: "abi_params",
    name: "ERC-20 Portal @cartesi/rollups@1.x",
    sliceInstructions: [
        { from: 1, to: 21, name: "tokenAddress" },
        { from: 21, to: 41, name: "from" },
        { from: 41, to: 73, name: "amount", type: "uint" },
    ],
    abiParams: [],
    conditionals: [
        {
            logicalOperator: "or",
            conditions: [
                {
                    field: "msgSender",
                    operator: "equals",
                    value: erc20PortalConfig.address.toLowerCase(),
                },
            ],
        },
    ],
    version: 1,
} as const;

const ERC721PortalSpec: Specification = {
    id: "6604795c-047e-4daa-a67b-845fa9efe1bd",
    version: 1,
    mode: "abi_params",
    name: "ERC-721 Portal @cartesi/rollups@1.x",
    sliceInstructions: [
        { from: 0, to: 20, name: "tokenAddress" },
        { from: 20, to: 40, name: "from" },
        { from: 40, to: 72, name: "tokenIndex", type: "uint" },
    ],
    abiParams: [],
    conditionals: [
        {
            logicalOperator: "or",
            conditions: [
                {
                    field: "msgSender",
                    operator: "equals",
                    value: erc721PortalConfig.address.toLowerCase(),
                },
            ],
        },
    ],
} as const;

const DAppAddressRelaySpec: Specification = {
    id: "7ec6e12d-ac9c-4034-9090-9be169ac6912",
    version: 1,
    mode: "abi_params",
    name: "DApp Address Relay @cartesi/rollups@1.x",
    sliceInstructions: [{ from: 0, to: 20, name: "dappAddress" }],
    abiParams: [],
    conditionals: [
        {
            logicalOperator: "or",
            conditions: [
                {
                    field: "msgSender",
                    operator: "equals",
                    value: dAppAddressRelayConfig.address.toLowerCase(),
                },
            ],
        },
    ],
};

export const systemSpecification = {
    ERC1155SinglePortalSpec,
    ERC1155BatchPortalSpec,
    ERC20PortalSpec,
    ERC721PortalSpec,
    DAppAddressRelaySpec,
} as const;

export const systemSpecificationAsList = Object.values(systemSpecification);
