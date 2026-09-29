import { safeErc20TransferAddress } from "@cartesi/client/abi";
import { isAddressEqual, type Hash } from "viem";
import { SAFE_ERC20_TRANSFER_BYTECODE } from "../../stories/util";
import { getBlockTime, getHead, type ClockState } from "./clock";
import type { ChainSnapshot } from "./eth";
import type { ApplicationData, NodeSnapshot } from "./rpc";
import type { TxRecord } from "./scenarios/chain";
import { buildRollupsTimeline } from "./scenarios/rollups";
import { prtScenarios, rollupsScenarios } from "./scenarios/specs";
import { buildPrtTimeline } from "./scenarios/timeline";
import {
    CHAIN_ID,
    viewPrtApplication,
    viewPrtChain,
    viewRollupsApplication,
    viewRollupsChain,
    type BlockTime,
    type ScenarioChain,
} from "./scenarios/view";

export const NODE_VERSION = "2.0.0-alpha.12";

type View = { head: bigint; time: BlockTime };

type Scenario = {
    name: string;
    presentAt?: number;
    build: (anchor: bigint) => { endsAt: bigint; txs: TxRecord[] };
    view: (anchor: bigint, view: View) => ApplicationData;
    chain: (anchor: bigint, head: bigint) => ScenarioChain;
};

const memo = <T>(build: (anchor: bigint) => T) => {
    const cache = new Map<bigint, T>();
    return (anchor: bigint) => {
        let value = cache.get(anchor);
        if (value === undefined) {
            value = build(anchor);
            cache.set(anchor, value);
        }
        return value;
    };
};

export const scenarios: Scenario[] = [
    ...prtScenarios.map((spec): Scenario => {
        const build = memo((anchor) => buildPrtTimeline(spec, anchor));
        const disputeAt = Number(build(0n).root.created.tx.block);
        return {
            name: spec.name,
            presentAt:
                spec.presentAt === undefined
                    ? undefined
                    : disputeAt + spec.presentAt,
            build,
            view: (anchor, view) => viewPrtApplication(build(anchor), view),
            chain: (anchor, head) => viewPrtChain(build(anchor), head),
        };
    }),
    ...rollupsScenarios.map((spec): Scenario => {
        const build = memo((anchor) => buildRollupsTimeline(spec, anchor));
        return {
            name: spec.name,
            presentAt: spec.presentAt,
            build,
            view: (anchor, view) => viewRollupsApplication(build(anchor), view),
            chain: (anchor, head) => viewRollupsChain(build(anchor), head),
        };
    }),
];

/**
 * Relative length of every scenario, to anchor them in the chain history.
 */
export const getScenarioSchedules = () =>
    scenarios.map((scenario) => ({
        name: scenario.name,
        duration: scenario.build(0n).endsAt,
        presentAt: scenario.presentAt,
    }));

const byBlock = (txs: TxRecord[]) => {
    const blocks = new Map<bigint, TxRecord[]>();
    txs.forEach((tx) =>
        blocks.set(tx.block, [...(blocks.get(tx.block) ?? []), tx]),
    );
    return blocks;
};

/**
 * The node and chain snapshots at the clock head, rebuilt only when the head
 * or the anchors change.
 */
export const createNodeSource = (
    getState: () => ClockState,
    now: () => number = Date.now,
) => {
    let cache:
        | { key: string; node: NodeSnapshot; chain: ChainSnapshot }
        | undefined;

    const current = () => {
        const state = getState();
        const head = getHead(state, now());
        const key = `${head}:${Object.values(state.anchors).join(",")}:${state.segments.length}`;
        if (cache?.key === key) return cache;

        const blockTime = (block: bigint) => getBlockTime(state, block);
        const time = (block: bigint) => new Date(blockTime(block));
        const active = scenarios.flatMap((scenario) => {
            const anchor = state.anchors[scenario.name] ?? head;
            return anchor <= head ? [{ scenario, anchor }] : [];
        });
        const txs = active.flatMap(({ scenario, anchor }) =>
            scenario.build(anchor).txs.filter((tx) => tx.block <= head),
        );
        const hashes = new Map(txs.map((tx) => [tx.hash, tx]));
        const blocks = byBlock(txs);
        const chains = active.map(({ scenario, anchor }) =>
            scenario.chain(anchor, head),
        );

        cache = {
            key,
            node: {
                chainId: CHAIN_ID,
                version: NODE_VERSION,
                applications: active.map(({ scenario, anchor }) =>
                    scenario.view(anchor, { head, time }),
                ),
            },
            chain: {
                chainId: CHAIN_ID,
                head,
                blockTime,
                transactions: (block) => blocks.get(block) ?? [],
                transaction: (hash: Hash) =>
                    hashes.get(hash.toLowerCase() as Hash),
                balance: (address) =>
                    chains.reduce<bigint | undefined>(
                        (found, chain) => found ?? chain.balance(address),
                        undefined,
                    ) ?? 0n,
                code: (address) =>
                    isAddressEqual(address, safeErc20TransferAddress)
                        ? SAFE_ERC20_TRANSFER_BYTECODE
                        : "0x",
                call: (to, data) =>
                    chains.reduce<ReturnType<ScenarioChain["call"]>>(
                        (found, chain) => found ?? chain.call(to, data),
                        undefined,
                    ),
            },
        };
        return cache;
    };

    return {
        node: () => current().node,
        chain: () => current().chain,
    };
};
