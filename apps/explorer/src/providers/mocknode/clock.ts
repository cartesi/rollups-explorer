export const BLOCK_TIME = 12_000;

/**
 * From `block`, reached at `time`, the head moves `speed` blocks per block
 * time. A zero speed holds the head.
 */
export type ClockSegment = { block: bigint; time: number; speed: number };

export type ClockState = {
    segments: ClockSegment[];
    /** Head block where each scenario's relative block zero sits. */
    anchors: Record<string, bigint>;
};

const lastSegment = (state: ClockState) =>
    state.segments[state.segments.length - 1];

export const getHead = (state: ClockState, now: number) => {
    const { block, time, speed } = lastSegment(state);
    if (speed === 0 || now <= time) return block;
    return block + BigInt(Math.floor(((now - time) * speed) / BLOCK_TIME));
};

/**
 * Time a block was reached, in milliseconds. Blocks before the session are a
 * block time apart, and later ones carry the time the head reached them.
 */
export const getBlockTime = (state: ClockState, block: bigint) => {
    const { segments } = state;
    const first = segments[0];
    if (block <= first.block) {
        return first.time - Number(first.block - block) * BLOCK_TIME;
    }
    for (let index = 0; index < segments.length; index++) {
        const segment = segments[index];
        if (block === segment.block) return segment.time;
        const next = segments[index + 1];
        if (segment.speed > 0 && (!next || block < next.block)) {
            return Math.round(
                segment.time +
                    (Number(block - segment.block) * BLOCK_TIME) /
                        segment.speed,
            );
        }
    }
    return lastSegment(state).time;
};

export type ScenarioSchedule = {
    name: string;
    /** Relative block of the scenario's last event. */
    duration: bigint;
    /** Relative block the session starts at, when the scenario is live. */
    presentAt?: number;
};

/**
 * Start a session at `head`, playing at the given speed, with each scenario
 * anchored so that it has already played out, or is at its present block.
 */
export const createClockState = (
    head: bigint,
    now: number,
    scenarios: ScenarioSchedule[],
    speed = 1,
): ClockState => ({
    segments: [{ block: head, time: now, speed }],
    anchors: Object.fromEntries(
        scenarios.map((scenario, index) => [
            scenario.name,
            head -
                (scenario.presentAt !== undefined
                    ? BigInt(scenario.presentAt)
                    : scenario.duration + 30n + BigInt(index) * 25n),
        ]),
    ),
});
