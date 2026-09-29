import { describe, expect, it } from "vitest";
import {
    BLOCK_TIME,
    createClockState,
    getBlockTime,
    getHead,
    getSpeed,
    isPlaying,
    pause,
    replay,
    reset,
    setSpeed,
    step,
    type ClockState,
} from "../../../src/providers/mocknode/clock";

const start = Date.UTC(2026, 8, 1);

describe("mock node clock", () => {
    it("should advance the head by the speed per block time", () => {
        const state = createClockState(1_000n, start, [], 10);
        expect(getHead(state, start)).toBe(1_000n);
        expect(getHead(state, start + BLOCK_TIME - 1)).toBe(1_009n);
        expect(getHead(state, start + BLOCK_TIME * 2)).toBe(1_020n);
    });

    it("should space past blocks a block time apart", () => {
        const state = createClockState(1_000n, start, []);
        expect(getBlockTime(state, 990n)).toBe(start - 10 * BLOCK_TIME);
        expect(getBlockTime(state, 1_000n)).toBe(start);
    });

    it("should stamp session blocks with the time the head reached them", () => {
        const state: ClockState = {
            anchors: {},
            segments: [
                { block: 1_000n, time: start, speed: 60 },
                { block: 1_060n, time: start + BLOCK_TIME, speed: 0 },
                { block: 1_061n, time: start + 5 * BLOCK_TIME, speed: 1 },
            ],
        };
        expect(getBlockTime(state, 1_030n)).toBe(start + BLOCK_TIME / 2);
        expect(getBlockTime(state, 1_060n)).toBe(start + BLOCK_TIME);
        expect(getBlockTime(state, 1_061n)).toBe(start + 5 * BLOCK_TIME);
        expect(getBlockTime(state, 1_063n)).toBe(start + 7 * BLOCK_TIME);
        expect(getHead(state, start + 7 * BLOCK_TIME)).toBe(1_063n);
    });

    it("should anchor finished scenarios in the past and live ones at their present", () => {
        const state = createClockState(10_000n, start, [
            { name: "done", duration: 400n },
            { name: "live", duration: 400n, presentAt: 110 },
        ]);
        expect(state.anchors.done).toBe(10_000n - 430n);
        expect(state.anchors.live).toBe(10_000n - 110n);
    });
});

describe("mock node clock controls", () => {
    const initial = createClockState(1_000n, start, [
        { name: "done", duration: 400n },
    ]);

    it("should pause, keep the head and resume from the time it resumes", () => {
        const paused = pause(initial, start + 5 * BLOCK_TIME);
        expect(isPlaying(paused)).toBe(false);
        expect(getHead(paused, start + 50 * BLOCK_TIME)).toBe(1_005n);
        const resumed = setSpeed(paused, start + 50 * BLOCK_TIME, 10);
        expect(getHead(resumed, start + 51 * BLOCK_TIME)).toBe(1_015n);
        expect(getBlockTime(resumed, 1_005n)).toBe(start + 5 * BLOCK_TIME);
        expect(getBlockTime(resumed, 1_006n)).toBe(
            start + 50 * BLOCK_TIME + BLOCK_TIME / 10,
        );
    });

    it("should keep block times when changing the speed while playing", () => {
        const fast = setSpeed(initial, start + 2.5 * BLOCK_TIME, 60);
        expect(getSpeed(fast)).toBe(60);
        expect(getBlockTime(fast, 1_002n)).toBe(start + 2 * BLOCK_TIME);
        expect(getHead(fast, start + 3 * BLOCK_TIME)).toBe(1_002n + 60n);
    });

    it("should step one block at a time", () => {
        const paused = pause(initial, start);
        const stepped = step(step(paused, start + 1000), start + 2000);
        expect(getHead(stepped, start + 60_000)).toBe(1_002n);
        expect(getBlockTime(stepped, 1_002n)).toBe(start + 2000);
    });

    it("should replay a scenario from the current head and reset the anchors", () => {
        const later = start + 100 * BLOCK_TIME;
        const replayed = replay(initial, later, "done");
        expect(replayed.anchors.done).toBe(1_100n);
        const restored = reset(pause(replayed, later), later, [
            { name: "done", duration: 400n },
        ]);
        expect(restored.anchors.done).toBe(1_100n - 430n);
        expect(getSpeed(restored)).toBe(1);
        expect(getHead(restored, later)).toBe(1_100n);
    });
});
