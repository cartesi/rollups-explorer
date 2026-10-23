import type { Input } from "@cartesi/client";
import {
    encodeErc1155BatchDeposit,
    encodeErc1155SingleDeposit,
    encodeErc20Deposit,
    encodeErc721Deposit,
    encodeEtherDeposit,
    encodeInput,
    erc1155BatchPortalAddress,
    erc1155SinglePortalAddress,
    erc20PortalAddress,
    erc721PortalAddress,
    etherPortalAddress,
} from "@cartesi/codec";
import { getUnixTime, subHours } from "date-fns";
import { keccak256, parseEther, toHex, type Address, type Hex } from "viem";

export type DepositKind =
    | "ether"
    | "erc20"
    | "erc721"
    | "erc1155"
    | "erc1155-batch";

export interface CreateDepositInputOptions {
    kind?: DepositKind;
    index?: bigint;
    epochIndex?: bigint;
    blockNumber?: bigint;
    status?: Input["status"];
    applicationContract?: Address;
    depositor?: Address;
    token?: Address;
    value?: bigint;
    tokenId?: bigint;
    tokenIds?: bigint[];
    values?: bigint[];
}

export const depositor: Address = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
export const applicationContract: Address =
    "0x7d6bcf9b5bb5bfb0ae793082c271931ec333e35d";
export const token: Address = "0x59b670e9fA9D0A427751Af201D676719a970857b";

const portalOf: Record<DepositKind, Address> = {
    ether: etherPortalAddress,
    erc20: erc20PortalAddress,
    erc721: erc721PortalAddress,
    erc1155: erc1155SinglePortalAddress,
    "erc1155-batch": erc1155BatchPortalAddress,
};

const encodePayload = (options: Required<CreateDepositInputOptions>): Hex => {
    const base = { sender: options.depositor, execLayerData: "0x" as Hex };
    switch (options.kind) {
        case "ether":
            return encodeEtherDeposit({ ...base, value: options.value });
        case "erc20":
            return encodeErc20Deposit({
                ...base,
                token: options.token,
                value: options.value,
            });
        case "erc721":
            return encodeErc721Deposit({
                ...base,
                token: options.token,
                tokenId: options.tokenId,
                baseLayerData: "0x",
            });
        case "erc1155":
            return encodeErc1155SingleDeposit({
                ...base,
                token: options.token,
                tokenId: options.tokenId,
                value: options.value,
                baseLayerData: "0x",
            });
        case "erc1155-batch":
            return encodeErc1155BatchDeposit({
                ...base,
                token: options.token,
                tokenIds: options.tokenIds,
                values: options.values,
                baseLayerData: "0x",
            });
    }
};

/** A node input that is a portal deposit, with realistic `rawData`. */
export const createDepositInput = (
    overrides: CreateDepositInputOptions = {},
): Input => {
    const options: Required<CreateDepositInputOptions> = {
        kind: "ether",
        index: 7n,
        epochIndex: 3n,
        blockNumber: 1200n,
        status: "NONE",
        applicationContract,
        depositor,
        token,
        value: parseEther("1.5"),
        tokenId: 7n,
        tokenIds: [7n, 9n],
        values: [3n, 1n],
        ...overrides,
    };
    const now = new Date();
    const sender = portalOf[options.kind];
    const payload = encodePayload(options);
    const header = {
        chainId: 31337n,
        blockNumber: options.blockNumber,
        blockTimestamp: BigInt(getUnixTime(subHours(now, 2))),
        prevRandao: 1n,
        index: options.index,
    };

    return {
        index: options.index,
        epochIndex: options.epochIndex,
        status: options.status,
        exceptionData: null,
        machineHash: null,
        txBufferDataBlock: null,
        decodedData: {
            ...header,
            applicationContract: options.applicationContract,
            sender,
            payload,
        },
        rawData: encodeInput({
            ...header,
            appContract: options.applicationContract,
            msgSender: sender,
            payload,
        }),
        blockNumber: header.blockNumber,
        transactionHash: keccak256(toHex(options.index)),
        logIndex: 0n,
        createdAt: now,
        updatedAt: now,
    };
};
