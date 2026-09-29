import {
    hexToBigInt,
    isHex,
    numberToHex,
    zeroAddress,
    zeroHash,
    type Address,
    type Hash,
    type Hex,
} from "viem";
import { RpcError, type MethodHandler } from "./rpc";
import { hashOf, type TxRecord } from "./scenarios/chain";

export type ChainSnapshot = {
    chainId: number;
    head: bigint;
    /** Time the block was reached, in milliseconds. */
    blockTime: (block: bigint) => number;
    transactions: (block: bigint) => TxRecord[];
    transaction: (hash: Hash) => TxRecord | undefined;
    balance: (address: Address) => bigint;
    code: (address: Address) => Hex;
    /** Result of a view call, or undefined when it reverts. */
    call: (to: Address, data: Hex) => Hex | undefined;
};

const executionReverted = -32000;

const blockHash = (block: bigint) => hashOf("block", block);

const args = (params: Record<string, unknown>) =>
    (params.args as unknown[] | undefined) ?? [];

const toBlockNumber = (tag: unknown, head: bigint) => {
    if (isHex(tag)) return hexToBigInt(tag);
    if (tag === "earliest") return 0n;
    return head;
};

const toTransaction = (chain: ChainSnapshot, tx: TxRecord) => ({
    hash: tx.hash,
    nonce: numberToHex(tx.seq),
    blockHash: blockHash(tx.block),
    blockNumber: numberToHex(tx.block),
    transactionIndex: numberToHex(
        chain.transactions(tx.block).findIndex((item) => item === tx),
    ),
    from: tx.from,
    to: tx.to,
    value: numberToHex(tx.value),
    gas: numberToHex(3_000_000),
    gasPrice: numberToHex(1_000_000_000),
    maxFeePerGas: numberToHex(2_000_000_000),
    maxPriorityFeePerGas: numberToHex(1_000_000),
    input: tx.input,
    type: "0x2",
    chainId: numberToHex(chain.chainId),
    accessList: [],
    v: "0x0",
    yParity: "0x0",
    r: hashOf(tx.hash, "r"),
    s: hashOf(tx.hash, "s"),
});

const toBlock = (chain: ChainSnapshot, number: bigint, full: boolean) => {
    const transactions = chain.transactions(number);
    return {
        number: numberToHex(number),
        hash: blockHash(number),
        parentHash: number > 0n ? blockHash(number - 1n) : zeroHash,
        nonce: "0x0000000000000000",
        mixHash: zeroHash,
        sha3Uncles:
            "0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347",
        logsBloom: `0x${"0".repeat(512)}`,
        transactionsRoot: hashOf("transactions", number),
        stateRoot: hashOf("state", number),
        receiptsRoot: hashOf("receipts", number),
        miner: zeroAddress,
        difficulty: "0x0",
        totalDifficulty: "0x0",
        extraData: "0x",
        size: numberToHex(600 + transactions.length * 200),
        gasLimit: numberToHex(30_000_000),
        gasUsed: numberToHex(transactions.length * 120_000),
        baseFeePerGas: numberToHex(1_000_000_000),
        timestamp: numberToHex(Math.floor(chain.blockTime(number) / 1000)),
        transactions: transactions.map((tx) =>
            full ? toTransaction(chain, tx) : tx.hash,
        ),
        uncles: [],
    };
};

/**
 * JSON-RPC handlers for the chain reads the explorer makes, answered from
 * the scenario timelines at the chain head.
 */
export const createEthHandlers = (
    snapshot: () => ChainSnapshot,
): Record<string, MethodHandler> => ({
    eth_chainId: () => numberToHex(snapshot().chainId),
    net_version: () => `${snapshot().chainId}`,
    eth_blockNumber: () => numberToHex(snapshot().head),
    eth_getBlockByNumber: (params) => {
        const chain = snapshot();
        const [tag, full] = args(params);
        const number = toBlockNumber(tag, chain.head);
        return number > chain.head
            ? null
            : toBlock(chain, number, full === true);
    },
    eth_getTransactionByHash: (params) => {
        const chain = snapshot();
        const tx = chain.transaction(args(params)[0] as Hash);
        return tx && tx.block <= chain.head ? toTransaction(chain, tx) : null;
    },
    eth_getBalance: (params) =>
        numberToHex(snapshot().balance(args(params)[0] as Address)),
    eth_getCode: (params) => snapshot().code(args(params)[0] as Address),
    eth_getStorageAt: () => zeroHash,
    eth_call: (params) => {
        const [call] = args(params) as [{ to?: Address; data?: Hex }];
        const result =
            call?.to && call.data
                ? snapshot().call(call.to, call.data)
                : undefined;
        if (result === undefined) {
            throw new RpcError(executionReverted, "execution reverted");
        }
        return result;
    },
});
