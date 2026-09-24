import type { Match, Tournament } from "@cartesi/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTournamentHierarchy } from "../../src/hooks/useTournamentHierarchy";
import { createMatch, createTournament } from "../../src/stories/prt";

const client = vi.hoisted(() => ({
    getTournament: vi.fn(),
    getMatch: vi.fn(),
}));

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

const application = "0x1111111111111111111111111111111111111111" as Address;
const epochIndex = 0n;

const rootTournamentAddress =
    "0xaaaa000000000000000000000000000000000001" as Address;
const parentTournamentAddress =
    "0xbbbb000000000000000000000000000000000002" as Address;
const parentMatchIdHash =
    "0xcccc000000000000000000000000000000000000000000000000000000000003" as `0x${string}`;

const makeTournament = (overrides: Partial<Tournament> = {}): Tournament =>
    createTournament({
        address: rootTournamentAddress,
        epochIndex,
        ...overrides,
    });

const makeMatch = (overrides: Partial<Match> = {}): Match =>
    createMatch({
        commitmentOne:
            "0x1111111111111111111111111111111111111111111111111111111111111111",
        commitmentTwo:
            "0x2222222222222222222222222222222222222222222222222222222222222222",
        epochIndex,
        idHash: parentMatchIdHash,
        leftOfTwo: "0x01" as `0x${string}`,
        tournamentAddress: rootTournamentAddress,
        txHash: "0xdeadbeef" as `0x${string}`,
        ...overrides,
    });

describe("useTournamentHierarchy", () => {
    beforeEach(() => {
        client.getTournament.mockReset();
        client.getMatch.mockReset();
    });

    const serve = (tournaments: Tournament[], matches: Match[]) => {
        client.getTournament.mockImplementation(
            async ({ address }: { address: Address }) =>
                tournaments.find(
                    (tournament) => tournament.address === address,
                ),
        );
        client.getMatch.mockImplementation(
            async ({ idHash }: { idHash: string }) =>
                matches.find((match) => match.idHash === idHash),
        );
    };

    describe("initial state", () => {
        it("should return empty matches and tournaments when no tournament option provided", () => {
            const { result } = renderHook(
                () => useTournamentHierarchy({ application, epochIndex }),
                { wrapper },
            );

            expect(result.current.matches).toEqual([]);
            expect(result.current.tournaments).toEqual([]);
            expect(client.getTournament).not.toHaveBeenCalled();
        });

        it("should return empty matches and tournaments when tournament has no parents", async () => {
            const { result } = renderHook(
                () =>
                    useTournamentHierarchy({
                        application,
                        epochIndex,
                        tournament: makeTournament(),
                    }),
                { wrapper },
            );

            await waitFor(() => expect(result.current.tournaments).toEqual([]));
            expect(result.current.matches).toEqual([]);
            expect(client.getTournament).not.toHaveBeenCalled();
        });
    });

    describe("searching state", () => {
        it("should remain with empty collections while fetching parent data", () => {
            client.getTournament.mockReturnValue(new Promise(() => {}));
            client.getMatch.mockReturnValue(new Promise(() => {}));

            const { result } = renderHook(
                () =>
                    useTournamentHierarchy({
                        application,
                        epochIndex,
                        tournament: makeTournament({
                            parentMatchIdHash,
                            parentTournamentAddress,
                        }),
                    }),
                { wrapper },
            );

            expect(result.current.matches).toEqual([]);
            expect(result.current.tournaments).toEqual([]);
        });
    });

    describe("Build parent child hierarchy", () => {
        it("should return parent tournament and match", async () => {
            const parentTournament = makeTournament({
                address: parentTournamentAddress,
            });
            const parentMatch = makeMatch({
                tournamentAddress: parentTournamentAddress,
            });
            serve([parentTournament], [parentMatch]);

            const { result } = renderHook(
                () =>
                    useTournamentHierarchy({
                        application,
                        epochIndex,
                        tournament: makeTournament({
                            parentMatchIdHash,
                            parentTournamentAddress,
                            level: 1n,
                        }),
                    }),
                { wrapper },
            );

            await waitFor(() =>
                expect(result.current.tournaments).toEqual([parentTournament]),
            );
            expect(result.current.matches).toEqual([parentMatch]);
            expect(client.getMatch).toHaveBeenCalledWith({
                application,
                epochIndex,
                tournamentAddress: parentTournamentAddress,
                idHash: parentMatchIdHash,
            });
        });

        it("should return hierarchy of tournaments and matches ordered by parent-child relationship", async () => {
            const childMatchIdHash =
                "0xdddd000000000000000000000000000000000000000000000000000000000004" as `0x${string}`;
            const childTournamentAddress =
                "0xeeee000000000000000000000000000000000003" as Address;

            const parentTournament = makeTournament({
                address: parentTournamentAddress,
            });
            const parentMatch = makeMatch({
                tournamentAddress: parentTournamentAddress,
            });
            const childTournament = makeTournament({
                address: childTournamentAddress,
                parentMatchIdHash,
                parentTournamentAddress,
                level: 1n,
            });
            const childMatch = makeMatch({
                idHash: childMatchIdHash,
                tournamentAddress: childTournamentAddress,
            });
            serve(
                [parentTournament, childTournament],
                [parentMatch, childMatch],
            );

            const { result } = renderHook(
                () =>
                    useTournamentHierarchy({
                        application,
                        epochIndex,
                        tournament: makeTournament({
                            address:
                                "0xffff000000000000000000000000000000000005" as Address,
                            parentMatchIdHash: childMatchIdHash,
                            parentTournamentAddress: childTournamentAddress,
                            level: 2n,
                        }),
                    }),
                { wrapper },
            );

            await waitFor(() =>
                expect(result.current.tournaments).toEqual([
                    parentTournament,
                    childTournament,
                ]),
            );
            expect(result.current.matches).toEqual([parentMatch, childMatch]);
        });
    });
});
