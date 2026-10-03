"use client";
import type { Match, Tournament } from "@cartesi/client";
import { serverUrl, useCartesiClient } from "@cartesi/react";
import { useQuery } from "@tanstack/react-query";
import { isNotNil } from "ramda";
import type { Address } from "viem";

export type UseTournamentHierarchyOpts = {
    application: string | Address;
    epochIndex: bigint;
    tournament?: Tournament;
};

type TournamentHierarchy = {
    matches: Match[];
    tournaments: Tournament[];
};

const emptyHierarchy: TournamentHierarchy = { matches: [], tournaments: [] };

/**
 * Hook to get the tournament hierarchy for a given tournament.
 * @param options options for the tournament hierarchy query.
 * @returns the ancestor tournaments and the matches that created their
 * children, ordered from the root tournament down.
 */
export const useTournamentHierarchy = (options: UseTournamentHierarchyOpts) => {
    const client = useCartesiClient();
    const { application, epochIndex, tournament } = options;

    const { data } = useQuery({
        queryKey: [
            serverUrl(client),
            "tournamentHierarchy",
            application,
            epochIndex.toString(),
            tournament?.address,
        ],
        queryFn: async () => {
            const hierarchy: TournamentHierarchy = {
                matches: [],
                tournaments: [],
            };
            let tournamentAddress = tournament?.parentTournamentAddress;
            let idHash = tournament?.parentMatchIdHash;
            while (tournamentAddress && idHash) {
                const [parent, match] = await Promise.all([
                    client.getTournament({
                        application,
                        address: tournamentAddress,
                    }),
                    client.getMatch({
                        application,
                        epochIndex,
                        tournamentAddress,
                        idHash,
                    }),
                ]);
                hierarchy.tournaments.unshift(parent);
                hierarchy.matches.unshift(match);
                tournamentAddress = parent.parentTournamentAddress;
                idHash = parent.parentMatchIdHash;
            }
            return hierarchy;
        },
        enabled: isNotNil(tournament),
        staleTime: Infinity,
    });

    return data ?? emptyHierarchy;
};
