import { beforeEach, describe, expect, it } from "vitest";
import { getHead, step } from "../../../src/providers/mocknode/clock";
import {
    clockAtom,
    initMockNodeStore,
    mockNodeStore,
    scenariosAtom,
    SESSION_HEAD,
    type MockScenario,
} from "../../../src/providers/mocknode/store";

const start = Date.UTC(2026, 8, 1);
const scenarios: MockScenario[] = [
    {
        name: "AppOne",
        address: "0xFc0E04b72f5630b277a07cD50c7F88Ca2331EB65",
        duration: 300n,
    },
];

describe("mock node store", () => {
    beforeEach(() => window.localStorage.clear());

    it("should start a new session and keep its changes", () => {
        initMockNodeStore(scenarios, start);
        expect(mockNodeStore.get(scenariosAtom)).toEqual(scenarios);
        const clock = mockNodeStore.get(clockAtom);
        expect(clock?.anchors.AppOne).toBe(SESSION_HEAD - 330n);

        mockNodeStore.set(clockAtom, step(clock!, start));
        initMockNodeStore(
            [...scenarios, { ...scenarios[0], name: "AppTwo" }],
            start + 60_000,
        );
        const restored = mockNodeStore.get(clockAtom);
        expect(getHead(restored!, start)).toBe(SESSION_HEAD + 1n);
        expect(restored?.anchors.AppTwo).toBe(SESSION_HEAD - 355n);
    });

    it("should start over when the saved session cannot be read", () => {
        window.localStorage.setItem(
            "rollups-explorer:mock-node:clock",
            "not json",
        );
        initMockNodeStore(scenarios, start);
        expect(mockNodeStore.get(clockAtom)?.segments).toEqual([
            { block: SESSION_HEAD, time: start, speed: 1 },
        ]);
    });
});
