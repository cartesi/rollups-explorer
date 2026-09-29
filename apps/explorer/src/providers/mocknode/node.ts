import { getBlockTime, getHead, type ClockState } from "./clock";
import type { NodeSnapshot } from "./rpc";
import { prtScenarios } from "./scenarios/specs";
import { buildPrtTimeline, type PrtTimeline } from "./scenarios/timeline";
import { CHAIN_ID, viewPrtApplication } from "./scenarios/view";

export const NODE_VERSION = "2.0.0-alpha.12";

const timelines = new Map<string, PrtTimeline>();

export const getPrtTimeline = (name: string, anchor: bigint) => {
    const key = `${name}@${anchor}`;
    let timeline = timelines.get(key);
    if (!timeline) {
        const spec = prtScenarios.find((scenario) => scenario.name === name);
        if (!spec) throw new Error(`unknown scenario ${name}`);
        timeline = buildPrtTimeline(spec, anchor);
        timelines.set(key, timeline);
    }
    return timeline;
};

/**
 * Relative length of every scenario, to anchor them in the chain history.
 */
export const getScenarioSchedules = () =>
    prtScenarios.map((spec) => ({
        name: spec.name,
        duration: getPrtTimeline(spec.name, 0n).endsAt,
        presentAt:
            spec.presentAt === undefined
                ? undefined
                : Number(getPrtTimeline(spec.name, 0n).root.created.tx.block) +
                  spec.presentAt,
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
            applications: prtScenarios
                .filter((spec) => (state.anchors[spec.name] ?? head) <= head)
                .map((spec) =>
                    viewPrtApplication(
                        getPrtTimeline(
                            spec.name,
                            state.anchors[spec.name] ?? head,
                        ),
                        { head, time },
                    ),
                ),
        };
        cache = { key, snapshot };
        return snapshot;
    };
};
