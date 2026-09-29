import { atom, createStore } from "jotai";
import type { Address } from "viem";
import {
    createClockState,
    type ClockState,
    type ScenarioSchedule,
} from "./clock";

export type MockScenario = ScenarioSchedule & { address: Address };

export const SESSION_HEAD = 25_000n;

const STORAGE_KEY = "rollups-explorer:mock-node:clock";

export const mockNodeStore = createStore();

export const clockAtom = atom<ClockState | null>(null);

export const scenariosAtom = atom<MockScenario[]>([]);

type StoredClock = {
    segments: { block: string; time: number; speed: number }[];
    anchors: Record<string, string>;
};

const serialize = (state: ClockState) =>
    JSON.stringify({
        segments: state.segments.map((segment) => ({
            ...segment,
            block: segment.block.toString(),
        })),
        anchors: Object.fromEntries(
            Object.entries(state.anchors).map(([name, anchor]) => [
                name,
                anchor.toString(),
            ]),
        ),
    } satisfies StoredClock);

const deserialize = (text: string): ClockState => {
    const stored: StoredClock = JSON.parse(text);
    return {
        segments: stored.segments.map((segment) => ({
            ...segment,
            block: BigInt(segment.block),
        })),
        anchors: Object.fromEntries(
            Object.entries(stored.anchors).map(([name, anchor]) => [
                name,
                BigInt(anchor),
            ]),
        ),
    };
};

const load = (): ClockState | null => {
    try {
        const text = window.localStorage.getItem(STORAGE_KEY);
        const state = text ? deserialize(text) : null;
        return state?.segments?.length ? state : null;
    } catch {
        return null;
    }
};

const save = (state: ClockState | null) => {
    try {
        if (state) window.localStorage.setItem(STORAGE_KEY, serialize(state));
    } catch {
        // storage unavailable, the session is not kept
    }
};

/**
 * Restore the clock of the last session, or start a new one, anchoring any
 * scenario the saved session does not know about.
 */
export const initMockNodeStore = (scenarios: MockScenario[], now: number) => {
    const fresh = createClockState(SESSION_HEAD, now, scenarios);
    const saved = load();
    const state = saved
        ? { ...saved, anchors: { ...fresh.anchors, ...saved.anchors } }
        : fresh;
    mockNodeStore.set(scenariosAtom, scenarios);
    mockNodeStore.set(clockAtom, state);
    mockNodeStore.sub(clockAtom, () => save(mockNodeStore.get(clockAtom)));
    save(state);
};
