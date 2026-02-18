/**
 * A group of specifications defined by the system. Mostly related to Cartesi Portals.
 * They can't be deleted or edited by the user.
 */
import {
    erc1155BatchPortalConfig,
    erc1155SinglePortalConfig,
    erc20PortalConfig,
    erc721PortalConfig,
    etherPortalConfig,
} from "@cartesi/wagmi";
import type { DbSpecification } from "./types";

const timestamp = 0;

const ERC1155SinglePortalSpec: DbSpecification = {
    id: "1a22a018-293c-4973-a355-d73648872c03",
    mode: "abi_params",
    name: `ERC-1155 Single Portal @cartesi/rollups@2.x`,
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
                    field: "decodedData.sender",
                    operator: "equals",
                    value: erc1155SinglePortalConfig.address.toLowerCase(),
                },
            ],
        },
    ],
    timestamp,
    abiParams: [],
    version: 1,
} as const;

const ERC1155BatchPortalSpec: DbSpecification = {
    id: "ccae05b0-e9de-43db-a7a8-033fa55fee0a",
    timestamp,
    mode: "abi_params",
    name: "ERC-1155 Batch Portal @cartesi/rollups@2.x",
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
                    field: "decodedData.sender",
                    operator: "equals",
                    value: erc1155BatchPortalConfig.address.toLowerCase(),
                },
            ],
        },
    ],
    version: 1,
} as const;

const ERC20PortalSpec: DbSpecification = {
    id: "46c084dd-4738-4cff-9303-4ef9e562985d",
    timestamp,
    mode: "abi_params",
    name: "ERC-20 Portal @cartesi/rollups@2.x",
    sliceInstructions: [
        { from: 1, to: 21, name: "tokenAddress" },
        { from: 21, to: 41, name: "from" },
        { from: 41, to: 73, name: "amount", type: "uint" },
        { from: 73, name: "execLayerData", optional: true },
    ],
    abiParams: [],
    conditionals: [
        {
            logicalOperator: "or",
            conditions: [
                {
                    field: "decodedData.sender",
                    operator: "equals",
                    value: erc20PortalConfig.address.toLowerCase(),
                },
            ],
        },
    ],
    version: 1,
} as const;

const ERC721PortalSpec: DbSpecification = {
    id: "6604795c-047e-4daa-a67b-845fa9efe1bd",
    timestamp,
    version: 1,
    mode: "abi_params",
    name: "ERC-721 Portal @cartesi/rollups@2.x",
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
                    field: "decodedData.sender",
                    operator: "equals",
                    value: erc721PortalConfig.address.toLowerCase(),
                },
            ],
        },
    ],
} as const;

const EtherPortalSpec: DbSpecification = {
    id: "84abc4d2-a41b-426b-b294-181d82598415",
    timestamp,
    version: 1,
    mode: "abi_params",
    name: "Ether Portal @cartesi/rollups@1.x",
    sliceInstructions: [
        { from: 0, to: 20, name: "sender" },
        { from: 20, to: 52, name: "amount", type: "uint256" },
        { from: 52, name: "execLayerData", optional: true },
    ],
    abiParams: [],
    conditionals: [
        {
            logicalOperator: "or",
            conditions: [
                {
                    field: "decodedData.sender",
                    operator: "equals",
                    value: etherPortalConfig.address.toLowerCase(),
                },
            ],
        },
    ],
} as const;

export const systemSpecification = {
    ERC1155SinglePortalSpec,
    ERC1155BatchPortalSpec,
    ERC20PortalSpec,
    ERC721PortalSpec,
    EtherPortalSpec,
} as const;

export const systemSpecificationAsList = Object.values(systemSpecification);
