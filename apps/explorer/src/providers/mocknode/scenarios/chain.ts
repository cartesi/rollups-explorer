import {
    getAddress,
    keccak256,
    slice,
    stringToHex,
    type Address,
    type Hash,
    type Hex,
} from "viem";
import { mulberry32 } from "../../../stories/util";

export const accounts = {
    node: "0x14dC79964da2C08b23698B3D3cc7Ca32193d9955",
    adversary: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    keeper: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    relay: "0x9c1E7A3C1d0b8F2E4a6b5c7D8e9f0a1b2c3D33d0",
    users: [
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
        "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    ],
} as const satisfies Record<string, Address | readonly Address[]>;

export type TxRecord = {
    hash: Hash;
    block: bigint;
    seq: number;
    from: Address;
    to: Address;
    input: Hex;
    value: bigint;
};

export type LogRecord = { tx: TxRecord; order: number; index: bigint };

export type Chain = {
    name: string;
    rng: () => number;
    txs: TxRecord[];
    logs: LogRecord[];
};

export const hashOf = (...parts: (string | bigint | number)[]): Hash =>
    keccak256(stringToHex(parts.join("/")));

export const addressOf = (...parts: (string | bigint | number)[]): Address =>
    getAddress(slice(hashOf(...parts), 12));

export const between = (chain: Chain, min: number, max: number) =>
    BigInt(min + Math.floor(chain.rng() * (max - min + 1)));

export const seedOf = (name: string) =>
    Number(BigInt(hashOf("seed", name)) % 4_294_967_296n);

export const sendTx = (
    chain: Chain,
    block: bigint,
    from: Address,
    to: Address,
    input: Hex,
    value = 0n,
): TxRecord => {
    const seq = chain.txs.length;
    const tx = {
        hash: hashOf(chain.name, "tx", seq),
        block,
        seq,
        from,
        to,
        input,
        value,
    };
    chain.txs.push(tx);
    return tx;
};

export const emit = (chain: Chain, tx: TxRecord): LogRecord => {
    const log = {
        tx,
        order: chain.logs.filter((other) => other.tx === tx).length,
        index: 0n,
    };
    chain.logs.push(log);
    return log;
};

export const assignLogIndexes = (logs: LogRecord[]) => {
    const sorted = [...logs].sort((a, b) =>
        a.tx.block !== b.tx.block
            ? Number(a.tx.block - b.tx.block)
            : a.tx.seq !== b.tx.seq
              ? a.tx.seq - b.tx.seq
              : a.order - b.order,
    );
    let block = -1n;
    let index = 0n;
    for (const log of sorted) {
        if (log.tx.block !== block) {
            block = log.tx.block;
            index = 0n;
        }
        log.index = index++;
    }
};

export const createChain = (name: string): Chain => ({
    name,
    rng: mulberry32(seedOf(name)),
    txs: [],
    logs: [],
});
