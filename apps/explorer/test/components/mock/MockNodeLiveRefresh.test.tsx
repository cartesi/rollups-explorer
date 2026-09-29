import {
    QueryClient,
    QueryClientProvider,
    useQuery,
} from "@tanstack/react-query";
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    MOCK_REFRESH_INTERVAL,
    MockNodeLiveRefresh,
} from "../../../src/components/mock/MockNodeLiveRefresh";
import {
    BLOCK_TIME,
    createClockState,
    pause,
    step,
} from "../../../src/providers/mocknode/clock";
import {
    clockAtom,
    mockNodeStore,
} from "../../../src/providers/mocknode/store";

const start = Date.UTC(2026, 8, 1);

const Queries = () => {
    useQuery({ queryKey: ["live"], queryFn: async () => 1 });
    useQuery({
        queryKey: ["immutable"],
        queryFn: async () => 2,
        staleTime: Infinity,
    });
    return null;
};

const setup = () => {
    const client = new QueryClient();
    const invalidate = vi.spyOn(client, "invalidateQueries");
    render(
        <QueryClientProvider client={client}>
            <Queries />
            <MockNodeLiveRefresh />
        </QueryClientProvider>,
    );
    return { client, invalidate };
};

describe("MockNodeLiveRefresh", () => {
    beforeEach(() => {
        vi.useFakeTimers({ now: start });
    });
    afterEach(() => vi.useRealTimers());

    it("should refresh live queries once per interval while the head moves", async () => {
        mockNodeStore.set(clockAtom, createClockState(1_000n, start, [], 60));
        const { client, invalidate } = setup();
        await act(async () => {
            await vi.advanceTimersByTimeAsync(MOCK_REFRESH_INTERVAL * 3);
        });
        expect(invalidate).toHaveBeenCalledTimes(3);
        const [filters] = invalidate.mock.calls[0];
        const live = client.getQueryCache().find({ queryKey: ["live"] });
        const immutable = client
            .getQueryCache()
            .find({ queryKey: ["immutable"] });
        expect(filters?.predicate?.(live!)).toBe(true);
        expect(filters?.predicate?.(immutable!)).toBe(false);
    });

    it("should not refresh while the head holds", async () => {
        mockNodeStore.set(
            clockAtom,
            pause(createClockState(1_000n, start, []), start),
        );
        const { invalidate } = setup();
        await act(async () => {
            await vi.advanceTimersByTimeAsync(BLOCK_TIME * 5);
        });
        expect(invalidate).not.toHaveBeenCalled();
    });

    it("should refresh right after a step", async () => {
        const paused = pause(createClockState(1_000n, start, []), start);
        mockNodeStore.set(clockAtom, paused);
        const { invalidate } = setup();
        act(() => mockNodeStore.set(clockAtom, step(paused, start)));
        expect(invalidate).toHaveBeenCalledTimes(1);
    });
});
