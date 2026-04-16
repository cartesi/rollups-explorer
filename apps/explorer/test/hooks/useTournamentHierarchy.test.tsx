import type { Match, Tournament } from "@cartesi/viem";
import { useMatch, useTournament } from "@cartesi/wagmi";
import { renderHook, waitFor } from "@testing-library/react";
import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTournamentHierarchy } from "../../src/hooks/useTournamentHierarchy";

vi.mock("@cartesi/wagmi", () => ({
    useMatch: vi.fn(),
    useTournament: vi.fn(),
}));

const mockUseTournament = vi.mocked(useTournament, { partial: true });
const mockUseMatch = vi.mocked(useMatch, { partial: true });

const application = "0x1111111111111111111111111111111111111111" as Address;
const epochIndex = 0n;

const rootTournamentAddress =
    "0xaaaa000000000000000000000000000000000001" as Address;
const parentTournamentAddress =
    "0xbbbb000000000000000000000000000000000002" as Address;
const parentMatchIdHash =
    "0xcccc000000000000000000000000000000000000000000000000000000000003" as `0x${string}`;

const makeTournament = (overrides: Partial<Tournament> = {}): Tournament => ({
    address: rootTournamentAddress,
    createdAt: new Date(),
    epochIndex,
    finalStateHash: null,
    finishedAtBlock: 0n,
    height: 48n,
    level: 0n,
    log2step: 44n,
    maxLevel: 3n,
    parentMatchIdHash: null,
    parentTournamentAddress: null,
    updatedAt: new Date(),
    winnerCommitment: null,
    ...overrides,
});

const makeMatch = (overrides: Partial<Match> = {}): Match => ({
    blockNumber: 1n,
    commitmentOne:
        "0x1111111111111111111111111111111111111111111111111111111111111111",
    commitmentTwo:
        "0x2222222222222222222222222222222222222222222222222222222222222222",
    createdAt: new Date(),
    deletionBlockNumber: null,
    deletionReason: "NOT_DELETED",
    deletionTxHash: null,
    epochIndex,
    idHash: parentMatchIdHash,
    leftOfTwo: "0x01" as `0x${string}`,
    tournamentAddress: rootTournamentAddress,
    txHash: "0xdeadbeef" as `0x${string}`,
    updatedAt: new Date(),
    winnerCommitment: "NONE" as const,
    ...overrides,
});

const idleQuery = { data: undefined, isFetching: false };
const loadingQuery = { data: undefined, isFetching: true };

describe("useTournamentHierarchy", () => {
    beforeEach(() => {
        mockUseTournament.mockReturnValue(idleQuery);
        mockUseMatch.mockReturnValue(idleQuery);
    });

    describe("initial state", () => {
        it("should return empty matches and tournaments when no tournament option provided", () => {
            const { result } = renderHook(() =>
                useTournamentHierarchy({ application, epochIndex }),
            );

            expect(result.current.matches).toEqual([]);
            expect(result.current.tournaments).toEqual([]);
        });

        it("should return empty matches and tournaments when tournament has no parents", () => {
            const tournament = makeTournament();

            const { result } = renderHook(() =>
                useTournamentHierarchy({
                    application,
                    epochIndex,
                    tournament: tournament,
                }),
            );

            expect(result.current.matches).toEqual([]);
            expect(result.current.tournaments).toEqual([]);
        });
    });

    describe("searching state", () => {
        it("should remain with empty collections while fetching parent data", () => {
            const tournament = makeTournament({
                parentMatchIdHash,
                parentTournamentAddress,
            });

            mockUseTournament.mockReturnValue(loadingQuery);
            mockUseMatch.mockReturnValue(loadingQuery);

            const { result } = renderHook(() =>
                useTournamentHierarchy({
                    application,
                    epochIndex,
                    tournament: tournament,
                }),
            );

            expect(result.current.matches).toEqual([]);
            expect(result.current.tournaments).toEqual([]);
        });
    });

    describe("Build parent child hierarchy", () => {
        describe("Single level tournament", () => {
            it("should return parent tournament and match", async () => {
                const childTournament = makeTournament({
                    parentMatchIdHash,
                    parentTournamentAddress,
                    level: 1n,
                });

                const parentTournament = makeTournament({
                    address: parentTournamentAddress,
                    parentMatchIdHash: null,
                    parentTournamentAddress: null,
                    level: 0n,
                });

                const parentMatch = makeMatch({
                    tournamentAddress: parentTournamentAddress,
                });

                // Simulate that the queries have completed.
                mockUseTournament.mockReturnValue({
                    data: parentTournament,
                    isFetching: false,
                });

                mockUseMatch.mockReturnValue({
                    data: parentMatch,
                    isFetching: false,
                });

                const { result } = renderHook(useTournamentHierarchy, {
                    initialProps: {
                        application,
                        epochIndex,
                        tournament: childTournament,
                    },
                });

                await waitFor(() => {
                    expect(result.current.tournaments).toHaveLength(1);
                });

                expect(result.current.tournaments[0]).toMatchObject({
                    address: parentTournamentAddress,
                });
                expect(result.current.matches).toHaveLength(1);
                expect(result.current.matches[0]).toMatchObject(parentMatch);
            });
        });

        describe("Multi level tournament", () => {
            it("should return hierarchy of tournaments and matches ordered by parent-child relationship", async () => {
                const childMatchIdHash =
                    "0xdddd000000000000000000000000000000000000000000000000000000000004" as `0x${string}`;
                const childTournamentAddress =
                    "0xeeee000000000000000000000000000000000003" as Address;

                const grandchildTournament = makeTournament({
                    address:
                        "0xffff000000000000000000000000000000000005" as Address,
                    parentMatchIdHash: childMatchIdHash,
                    parentTournamentAddress: childTournamentAddress,
                    level: 2n,
                });

                const childMatch = makeMatch({
                    idHash: childMatchIdHash,
                    tournamentAddress: childTournamentAddress,
                });

                const childTournament = makeTournament({
                    address: childTournamentAddress,
                    parentMatchIdHash,
                    parentTournamentAddress,
                    level: 1n,
                });

                const parentTournament = makeTournament({
                    address: parentTournamentAddress,
                    parentMatchIdHash: null,
                    parentTournamentAddress: null,
                    level: 0n,
                });

                const parentMatch = makeMatch({
                    tournamentAddress: parentTournamentAddress,
                });

                mockUseTournament
                    .mockReturnValueOnce(idleQuery)
                    .mockReturnValueOnce({
                        isFetching: false,
                        data: childTournament,
                    })
                    .mockReturnValueOnce({
                        isFetching: false,
                        data: parentTournament,
                    });

                mockUseMatch
                    .mockReturnValueOnce(idleQuery)
                    .mockReturnValueOnce({
                        data: childMatch,
                        isFetching: false,
                    })
                    .mockReturnValueOnce({
                        data: parentMatch,
                        isFetching: false,
                    });

                const { result } = renderHook(useTournamentHierarchy, {
                    initialProps: {
                        application,
                        epochIndex,
                        tournament: grandchildTournament,
                    },
                });

                await waitFor(() =>
                    expect(result.current.tournaments).toHaveLength(2),
                );

                expect(result.current.tournaments[0]).toMatchObject({
                    address: parentTournamentAddress,
                });

                expect(result.current.tournaments[1]).toMatchObject({
                    address: childTournament.address,
                });
                expect(result.current.matches).toHaveLength(2);
                expect(result.current.matches[0]).toMatchObject(parentMatch);
                expect(result.current.matches[1]).toMatchObject(childMatch);
            });
        });
    });
});
