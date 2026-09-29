import { describe, expect, it } from "vitest";
import {
    BLOCK_TIME,
    createClockState,
    getBlockTime,
    getHead,
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
