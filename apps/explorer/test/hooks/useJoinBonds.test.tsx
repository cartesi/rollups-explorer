import { iTournamentAbi } from "@cartesi/client/abi";
import { useReadITournamentBondValue } from "@cartesi/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { encodeFunctionData, keccak256, toHex, zeroHash } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getTransaction } from "wagmi/actions";
import { useJoinBonds } from "../../src/hooks/useJoinBonds";
import { createCommitment, createTournament } from "../../src/stories/prt";

vi.mock("wagmi", () => ({
    useConfig: () => ({ state: { chainId: 31337 } }),
}));

vi.mock("wagmi/actions", () => ({
    getTransaction: vi.fn(),
}));

vi.mock("@cartesi/react", () => ({
    useReadITournamentBondValue: vi.fn(),
}));

const mockGetTransaction = vi.mocked(getTransaction);
const mockBondValue = vi.mocked(useReadITournamentBondValue);

const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider
        client={
            new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
    >
        {children}
    </QueryClientProvider>
);

const tournament = createTournament();
const bondValue = 21_000_000_000_000_000n;
const joinInput = encodeFunctionData({
    abi: iTournamentAbi,
    functionName: "joinTournament",
    args: [zeroHash, [], zeroHash, zeroHash],
});
const direct = createCommitment({
    commitment: keccak256(toHex("direct")),
    txHash: keccak256(toHex("direct-tx")),
});
const relayed = createCommitment({
    commitment: keccak256(toHex("relayed")),
    txHash: keccak256(toHex("relayed-tx")),
});

describe("useJoinBonds", () => {
    beforeEach(() => {
        mockBondValue.mockReturnValue({
            data: bondValue,
            isPending: false,
        } as never);
        mockGetTransaction.mockReset();
        mockGetTransaction.mockImplementation(
            async (_config, { hash }) =>
                (hash === direct.txHash
                    ? {
                          to: tournament.address,
                          input: joinInput,
                          value: 25_000_000_000_000_000n,
                      }
                    : {
                          to: "0x9c1e7a3c1d0b8f2e4a6b5c7d8e9f0a1b2c3d33d0",
                          input: "0x6a761202",
                          value: 0n,
                      }) as never,
        );
    });

    it("should read the exact amount of a direct join", async () => {
        const { result } = renderHook(
            () => useJoinBonds(tournament, [direct]),
            { wrapper },
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.bonds.get(direct.commitment)).toEqual({
            commitment: direct.commitment,
            depositor: direct.submitterAddress,
            txHash: direct.txHash,
            value: 25_000_000_000_000_000n,
            exact: true,
        });
    });

    it("should fall back to the bond value for a relayed join", async () => {
        const { result } = renderHook(
            () => useJoinBonds(tournament, [relayed]),
            { wrapper },
        );

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.bonds.get(relayed.commitment)).toMatchObject({
            value: bondValue,
            exact: false,
        });
    });

    it("should report loading until the transactions arrive", () => {
        mockGetTransaction.mockImplementation(() => new Promise(() => {}));
        mockBondValue.mockReturnValue({
            data: undefined,
            isPending: true,
        } as never);

        const { result } = renderHook(
            () => useJoinBonds(tournament, [direct]),
            { wrapper },
        );

        expect(result.current.isLoading).toBe(true);
        expect(result.current.bonds.size).toBe(0);
    });

    it("should resolve nothing without commitments", () => {
        const { result } = renderHook(() => useJoinBonds(tournament, []), {
            wrapper,
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.bonds.size).toBe(0);
        expect(mockGetTransaction).not.toHaveBeenCalled();
    });
});
