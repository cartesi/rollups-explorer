import type { Epoch, Input } from "@cartesi/client";
import { iApplicationAbi } from "@cartesi/react";
import { http, HttpResponse } from "msw";
import {
    decodeFunctionData,
    encodeAbiParameters,
    erc20Abi,
    parseUnits,
    type Address,
    type Hex,
} from "viem";
import type { RefundableDeposit } from "../components/refund/RefundableDeposits";
import { createDepositInput, depositor, token } from "./deposits";
import {
    createMethodNotFoundResponse,
    STORIES_RPC_URL,
    type GenericJSONRPCRequest,
} from "./util";

const applicationContract = "0x40a7C73a6a592D8697bE97254E273E6f3FB46000";
const gameToken: Address = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
const date = new Date("2026-10-09T10:00:00Z");

const epoch = (overrides: Partial<Epoch> & Pick<Epoch, "index">): Epoch => ({
    firstBlock: 0n,
    lastBlock: 0n,
    inputIndexLowerBound: 0n,
    inputIndexUpperBound: 0n,
    tournamentAddress: null,
    machineHash: null,
    commitment: null,
    claimTransactionHash: null,
    status: "OPEN",
    virtualIndex: overrides.index,
    createdAt: date,
    updatedAt: date,
    commitmentProof: null,
    txBufferDataBlock: null,
    txBufferProof: null,
    iflagsYDataBlock: null,
    iflagsYProof: null,
    htifTohostDataBlock: null,
    htifTohostProof: null,
    stagedAtBlock: 0n,
    ...overrides,
});

/** Epoch 52 was open at the foreclose block (15498) and holds three deposits; epoch 51 was accepted before. */
export const refundEpochs: Epoch[] = [
    epoch({
        index: 52n,
        firstBlock: 15391n,
        lastBlock: 15498n,
        inputIndexLowerBound: 1n,
        inputIndexUpperBound: 4n,
        status: "CLAIM_FORECLOSED",
    }),
    epoch({
        index: 51n,
        firstBlock: 15090n,
        lastBlock: 15391n,
        inputIndexLowerBound: 0n,
        inputIndexUpperBound: 1n,
        machineHash:
            "0x227d685f612568ed2d5b34fb8e3c19eef80097430498fd2b4a60e73c59e75e8a",
        commitment:
            "0x725e9d3febbdd79841345f187aacf343ee497214277f3cb330aca90319cbdd92",
        status: "CLAIM_ACCEPTED",
    }),
];

const deposit = (
    overrides: Parameters<typeof createDepositInput>[0] = {},
): Input =>
    createDepositInput({ applicationContract, epochIndex: 52n, ...overrides });

export const etherDepositInput = deposit({ index: 3n, blockNumber: 15497n });
export const erc20DepositInput = deposit({
    kind: "erc20",
    index: 2n,
    blockNumber: 15450n,
    value: parseUnits("250", 6),
});
export const erc1155BatchDepositInput = deposit({
    kind: "erc1155-batch",
    index: 1n,
    blockNumber: 15402n,
    token: gameToken,
});
export const acceptedDepositInput = deposit({
    index: 0n,
    epochIndex: 51n,
    blockNumber: 15300n,
    status: "ACCEPTED",
});

export const refundableDeposits: RefundableDeposit[] = [
    {
        input: etherDepositInput,
        asset: { kind: "ether", depositor, value: parseUnits("1.5", 18) },
        status: "refundable",
    },
    {
        input: erc20DepositInput,
        asset: {
            kind: "erc20",
            depositor,
            token,
            value: parseUnits("250", 6),
            symbol: "USDC",
            decimals: 6,
        },
        status: "refunded",
    },
    {
        input: erc1155BatchDepositInput,
        asset: {
            kind: "erc1155-batch",
            depositor,
            token: gameToken,
            symbol: "GAME",
            items: [
                { tokenId: 7n, value: 3n },
                { tokenId: 9n, value: 1n },
            ],
        },
        status: "refundable",
    },
];

interface RefundRpcOptions {
    /** Input indices whose refund was already issued. */
    issued?: bigint[];
    /** Answers the requests that are not refund reads. Default: method not found. */
    fallback?: (body: GenericJSONRPCRequest) => Response;
}

const tokenMetadata: Record<string, { symbol: string; decimals: number }> = {
    [token.toLowerCase()]: { symbol: "USDC", decimals: 6 },
    [gameToken.toLowerCase()]: { symbol: "GAME", decimals: 0 },
};

const readAbi = [...iApplicationAbi, ...erc20Abi];

const decodeRead = (data: Hex) => {
    try {
        return decodeFunctionData({ abi: readAbi, data });
    } catch {
        return undefined;
    }
};

const encodeRead = (call: { to: Address; data: Hex }, issued: bigint[]) => {
    const read = decodeRead(call.data);
    const metadata = tokenMetadata[call.to.toLowerCase()];
    switch (read?.functionName) {
        case "wasRefundForInputIssued":
            return encodeAbiParameters(
                [{ type: "bool" }],
                [issued.includes(read.args[0] as bigint)],
            );
        case "symbol":
            return (
                metadata &&
                encodeAbiParameters([{ type: "string" }], [metadata.symbol])
            );
        case "decimals":
            return (
                metadata &&
                encodeAbiParameters([{ type: "uint8" }], [metadata.decimals])
            );
        default:
            return undefined;
    }
};

/** Chain RPC handler for the refund reads: the refund flag per input index, plus `symbol` and `decimals` of the fixture tokens. */
export const refundRpcHandler = ({
    issued = [],
    fallback = createMethodNotFoundResponse,
}: RefundRpcOptions = {}) =>
    http.post(STORIES_RPC_URL, async ({ request }) => {
        const body = (await request.json()) as GenericJSONRPCRequest;
        const [call] = (body.params ?? []) as [{ to: Address; data: Hex }?];
        const result =
            body.method === "eth_call" && call
                ? encodeRead(call, issued)
                : undefined;
        return result
            ? HttpResponse.json({ jsonrpc: "2.0", id: body.id, result })
            : fallback(body);
    });
