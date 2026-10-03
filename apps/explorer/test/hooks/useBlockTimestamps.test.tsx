import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getBlock } from "wagmi/actions";
import { useBlockTimestamps } from "../../src/hooks/useBlockTimestamps";

vi.mock("wagmi", () => ({
    useConfig: () => ({ state: { chainId: 31337 } }),
}));

vi.mock("wagmi/actions", () => ({
    getBlock: vi.fn(),
}));

const mockGetBlock = vi.mocked(getBlock);

const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider
        client={
            new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
    >
        {children}
    </QueryClientProvider>
);

describe("useBlockTimestamps", () => {
    beforeEach(() => {
        mockGetBlock.mockReset();
        mockGetBlock.mockImplementation(
            async (_config, options) =>
                ({ timestamp: (options?.blockNumber ?? 0n) * 12n }) as never,
        );
    });

    it("should map each block to its timestamp in milliseconds", async () => {
        const { result } = renderHook(
            () => useBlockTimestamps([10n, 20n, null, undefined]),
            { wrapper },
        );

        await waitFor(() => expect(result.current.timestamps.size).toBe(2));
        expect(result.current.timestamps.get(10n)).toBe(120_000);
        expect(result.current.timestamps.get(20n)).toBe(240_000);
    });

    it("should fetch a repeated block once", async () => {
        const { result } = renderHook(() => useBlockTimestamps([5n, 5n]), {
            wrapper,
        });

        await waitFor(() => expect(result.current.timestamps.size).toBe(1));
        expect(mockGetBlock).toHaveBeenCalledTimes(1);
    });

    it("should report loading until every block is fetched", async () => {
        const { result } = renderHook(() => useBlockTimestamps([7n]), {
            wrapper,
        });

        expect(result.current.isLoading).toBe(true);
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.timestamps.get(7n)).toBe(84_000);
    });

    it("should not be loading without blocks", () => {
        const { result } = renderHook(() => useBlockTimestamps([null]), {
            wrapper,
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.timestamps.size).toBe(0);
    });
});
