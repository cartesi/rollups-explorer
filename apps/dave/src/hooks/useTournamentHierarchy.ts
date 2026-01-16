"use client";
import type { Match, Tournament } from "@cartesi/viem";
import { useMatch, useTournament } from "@cartesi/wagmi";
import { isNotNil } from "ramda";
import { useEffect, useRef, useState } from "react";
import type { Address } from "viem";

type useTournamentHierarchyOpts = {
    application: string | Address;
    epochIndex: bigint;
    tournament?: Tournament;
};

type SearchStatus = "idle" | "searching" | "done";

type NextParents = {
    parentTournamentAddress?: Tournament["parentTournamentAddress"];
    parentMatchIdHash?: Tournament["parentMatchIdHash"];
};

const newAccumulators = () => ({
    matches: [] as Match[],
    tournaments: [] as Tournament[],
});

const getSearchStatus = (params: {
    hasParentsToSearch: boolean;
    isFetching: boolean;
}): SearchStatus => {
    if (params.hasParentsToSearch && params.isFetching) return "searching";
    if (params.hasParentsToSearch && !params.isFetching) return "done";

    return "idle";
};

/**
 * Hook to get the tournament hierarchy for a given tournament.
 * @param options options for the tournament hierarchy query.
 * @returns
 */
export const useTournamentHierarchy = (options: useTournamentHierarchyOpts) => {
    const [nextParents, setNextParents] = useState<NextParents>({});
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);

    const accRef = useRef({
        matches: [] as Match[],
        tournaments: [] as Tournament[],
    });

    const tournamentQuery = useTournament({
        application: options.application,
        address: nextParents.parentTournamentAddress!,
        enabled: isNotNil(nextParents.parentTournamentAddress),
    });

    const matchQuery = useMatch({
        application: options.application,
        epochIndex: options.epochIndex,
        tournamentAddress: nextParents.parentTournamentAddress!,
        idHash: nextParents.parentMatchIdHash!,
        enabled:
            isNotNil(nextParents.parentMatchIdHash) &&
            isNotNil(nextParents.parentTournamentAddress),
    });

    const hasParentsToSearch =
        isNotNil(nextParents.parentMatchIdHash) &&
        isNotNil(nextParents.parentTournamentAddress);
    const isFetching = tournamentQuery.isFetching || matchQuery.isFetching;

    const searchStatus: SearchStatus = getSearchStatus({
        hasParentsToSearch,
        isFetching,
    });

    useEffect(() => {
        setNextParents({
            parentMatchIdHash: options.tournament?.parentMatchIdHash,
            parentTournamentAddress:
                options.tournament?.parentTournamentAddress,
        });
    }, [options.tournament]);

    useEffect(() => {
        if (searchStatus === "done") {
            const pTournament = tournamentQuery.data;
            const pMatch = matchQuery.data;
            const { parentMatchIdHash, parentTournamentAddress } =
                pTournament ?? {};
            if (!parentMatchIdHash && !parentTournamentAddress) {
                const matches = isNotNil(pMatch)
                    ? [pMatch, ...accRef.current.matches]
                    : accRef.current.matches;
                const tournaments = isNotNil(pTournament)
                    ? [pTournament, ...accRef.current.tournaments]
                    : accRef.current.tournaments;

                setMatches(matches);
                setTournaments(tournaments);
                accRef.current = newAccumulators();
            } else {
                accRef.current.matches.unshift(pMatch!);
                accRef.current.tournaments.unshift(pTournament!);
            }

            setNextParents({ parentMatchIdHash, parentTournamentAddress });
        }
    }, [searchStatus, matchQuery.data, tournamentQuery.data]);

    return { matches, tournaments };
};
