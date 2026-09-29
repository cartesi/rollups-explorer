import { getBlockTime, getHead, type ClockState } from "./clock";
import type { ApplicationData, NodeSnapshot } from "./rpc";
import { buildRollupsTimeline } from "./scenarios/rollups";
import { prtScenarios, rollupsScenarios } from "./scenarios/specs";
import { buildPrtTimeline } from "./scenarios/timeline";
import {
    CHAIN_ID,
    viewPrtApplication,
    viewRollupsApplication,
    type BlockTime,
} from "./scenarios/view";

export const NODE_VERSION = "2.0.0-alpha.12";

type View = { head: bigint; time: BlockTime };

type Scenario = {
    name: string;
    presentAt?: number;
    build: (anchor: bigint) => { endsAt: bigint };
    view: (anchor: bigint, view: View) => ApplicationData;
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
        };
    }),
    ...rollupsScenarios.map((spec): Scenario => {
        const build = memo((anchor) => buildRollupsTimeline(spec, anchor));
        return {
            name: spec.name,
            presentAt: spec.presentAt,
            build,
            view: (anchor, view) => viewRollupsApplication(build(anchor), view),
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

/**
 * The node snapshot at the clock head, rebuilt only when the head or the
 * anchors change.
 */
export const createNodeSource = (
    getState: () => ClockState,
    now: () => number = Date.now,
) => {
    let cache: { key: string; snapshot: NodeSnapshot } | undefined;

    return (): NodeSnapshot => {
        const state = getState();
        const head = getHead(state, now());
        const key = `${head}:${Object.values(state.anchors).join(",")}:${state.segments.length}`;
        if (cache?.key === key) return cache.snapshot;

        const time = (block: bigint) => new Date(getBlockTime(state, block));
        const snapshot: NodeSnapshot = {
            chainId: CHAIN_ID,
            version: NODE_VERSION,
            applications: scenarios.flatMap((scenario) => {
                const anchor = state.anchors[scenario.name] ?? head;
                return anchor <= head
                    ? [scenario.view(anchor, { head, time })]
                    : [];
            }),
        };
        cache = { key, snapshot };
        return snapshot;
    };
};
