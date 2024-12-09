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
    etherPortalConfig,
    v2Erc1155BatchPortalConfig,
    v2Erc1155SinglePortalConfig,
    v2Erc20PortalConfig,
    v2Erc721PortalConfig,
    v2EtherPortalConfig,
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
        { from: 73, name: "execLayerData", optional: true },
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

const EtherPortalSpec: Specification = {
    id: "84abc4d2-a41b-426b-b294-181d82598415",
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
                    field: "msgSender",
                    operator: "equals",
                    value: etherPortalConfig.address.toLowerCase(),
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

const V2EtherPortalSpec: Specification = {
    id: "52a35267-7c06-4f0b-b329-0f567eab5ed4",
    version: 1,
    mode: "abi_params",
    name: "Ether Portal @cartesi/rollups@2.x",
    sliceInstructions: EtherPortalSpec.sliceInstructions,
    abiParams: [],
    conditionals: [
        {
            logicalOperator: "or",
            conditions: [
                {
                    field: "msgSender",
                    operator: "equals",
                    value: v2EtherPortalConfig.address.toLowerCase(),
                },
            ],
        },
    ],
} as const;

const V2ERC1155SinglePortalSpec: Specification = {
    id: "68ae9335-2494-437b-87c7-ac0c8dc7058b",
    mode: "abi_params",
    name: `ERC-1155 Single Portal @cartesi/rollups@2.x`,
    sliceInstructions: ERC1155SinglePortalSpec.sliceInstructions,
    conditionals: [
        {
            logicalOperator: "or",
            conditions: [
                {
                    field: "msgSender",
                    operator: "equals",
                    value: v2Erc1155SinglePortalConfig.address.toLowerCase(),
                },
            ],
        },
    ],
    abiParams: [],
    version: 1,
} as const;

const V2ERC1155BatchPortalSpec: Specification = {
    id: "54ee4a79-f725-4078-98ac-d2fa5fd287f9",
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
                    field: "msgSender",
                    operator: "equals",
                    value: v2Erc1155BatchPortalConfig.address.toLowerCase(),
                },
            ],
        },
    ],
    version: 1,
} as const;

const V2ERC20PortalSpec: Specification = {
    id: "451150d0-6936-4e4a-882d-44b264bf5f30",
    mode: "abi_params",
    name: "ERC-20 Portal @cartesi/rollups@2.x",
    sliceInstructions: [
        { from: 0, to: 20, name: "tokenAddress" },
        { from: 20, to: 40, name: "from" },
        { from: 40, to: 72, name: "amount", type: "uint" },
        { from: 72, name: "execLayerData", optional: true },
    ],
    abiParams: [],
    conditionals: [
        {
            logicalOperator: "or",
            conditions: [
                {
                    field: "msgSender",
                    operator: "equals",
                    value: v2Erc20PortalConfig.address.toLowerCase(),
                },
            ],
        },
    ],
    version: 1,
} as const;

const V2ERC721PortalSpec: Specification = {
    id: "12fa0cd4-aaa2-4ec9-b38d-0cb0cb19a919",
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
                    field: "msgSender",
                    operator: "equals",
                    value: v2Erc721PortalConfig.address.toLowerCase(),
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
    DAppAddressRelaySpec,
    V2EtherPortalSpec,
    V2ERC1155BatchPortalSpec,
    V2ERC1155SinglePortalSpec,
    V2ERC20PortalSpec,
    V2ERC721PortalSpec,
} as const;

export const systemSpecificationAsList = Object.values(systemSpecification);
