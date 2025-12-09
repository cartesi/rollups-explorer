import type { Match, Tournament } from "@cartesi/viem";
import { useCartesiClient } from "@cartesi/wagmi";
import { useEffect, useState } from "react";
import type { Address } from "viem";

/**
 * Hook to get the tournament hierarchy for a given tournament.
 * @param options options for the tournament hierarchy query.
 * @returns
 */
export const useTournamentHierarchy = (options: {
    application: string | Address;
    epochIndex: bigint;
    tournament?: Tournament;
}) => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);
    const client = useCartesiClient();

    useEffect(() => {
        const fetch = async (tournament: Tournament) => {
            const tournaments: Tournament[] = [];
            const matches: Match[] = [];
            let t: Tournament = tournament;
            while (t.parentTournamentAddress && t.parentMatchIdHash) {
                const { parentTournamentAddress, parentMatchIdHash } = t;
                t = await client.getTournament({
                    application: options.application,
                    address: parentTournamentAddress,
                });
                tournaments.unshift(t);
                matches.unshift(
                    await client.getMatch({
                        ...options,
                        tournamentAddress: parentTournamentAddress,
                        idHash: parentMatchIdHash,
                    }),
                );
            }
            return { tournaments, matches };
        };
        if (options.tournament) {
            fetch(options.tournament).then(({ tournaments, matches }) => {
                setTournaments(tournaments);
                setMatches(matches);
            });
        }
    }, [options.application, options.epochIndex, options.tournament?.address]);
    return { matches, tournaments };
};
