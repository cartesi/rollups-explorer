import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    bondEventSummaryPageSize,
    useBondEventSummary,
} from "../../src/hooks/useBondEventSummary";
import { createBondEvent } from "../../src/stories/prt";

const client = vi.hoisted(() => ({ listBondEvents: vi.fn() }));

vi.mock("@cartesi/react", () => ({
    serverUrl: () => "http://127.0.0.1:10011/rpc",
    useCartesiClient: () => client,
}));

const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider
        client={
            new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
    >
        {children}
    </QueryClientProvider>
);

const application = "honeypot";

describe("useBondEventSummary", () => {
    beforeEach(() => {
        client.listBondEvents.mockReset();
        client.listBondEvents.mockResolvedValue({
            data: [createBondEvent()],
            pagination: { limit: 1, offset: 0, totalCount: 1 },
        });
    });

    it("should fetch every event of the epoch in bounded pages", async () => {
        const totalCount = bondEventSummaryPageSize * 2 + 1;
        const { result } = renderHook(
            () =>
                useBondEventSummary({
                    application,
                    epochIndex: 3n,
                    totalCount,
                }),
            { wrapper },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(client.listBondEvents).toHaveBeenCalledTimes(3);
        expect(client.listBondEvents).toHaveBeenLastCalledWith({
            application,
            epochIndex: 3n,
            limit: bondEventSummaryPageSize,
            offset: bondEventSummaryPageSize * 2,
        });
        expect(result.current.data?.totals.refunded).toBe(
            3_000_000_000_000_000n,
        );
        expect(result.current.data?.accounts).toHaveLength(1);
    });

    it("should not fetch without a selected epoch", () => {
        renderHook(() => useBondEventSummary({ application, totalCount: 10 }), {
            wrapper,
        });

        expect(client.listBondEvents).not.toHaveBeenCalled();
    });

    it("should not fetch when the epoch has no events", () => {
        renderHook(
            () =>
                useBondEventSummary({
                    application,
                    epochIndex: 3n,
                    totalCount: 0,
                }),
            { wrapper },
        );

        expect(client.listBondEvents).not.toHaveBeenCalled();
    });
});
