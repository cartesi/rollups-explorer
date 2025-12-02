import type {
    Match as CartesiMatch,
    CartesiPublicClient,
    MatchAdvanced,
} from "@cartesi/viem";
import { useCartesiClient, useEpoch, useMatch } from "@cartesi/wagmi";
import { useQuery } from "@tanstack/react-query";
import { omit } from "ramda";
import { useEffect, useState } from "react";
import { type Address, type Hex } from "viem";
import type { Match, MatchAction, Tournament } from "../components/types";
import { NETWORK_DELAY } from "./constants";
import { findMatch, findMatchTournament, getMatch } from "./match.data";

interface MatchDetailParam {
    applicationId: string | Hex;
    epochIndex: number;
    matchId: Hex;
}
interface MatchParams extends MatchDetailParam {
    tournamentId: Hex;
}

const queryKeys = {
    all: () => ["matches"] as const,
    app: ({ applicationId }: MatchDetailParam) =>
        [...queryKeys.all(), "app", applicationId] as const,
    epoch: (params: MatchDetailParam) =>
        [...queryKeys.app(params), "epoch", params.epochIndex] as const,
    tournament: (params: MatchDetailParam) =>
        [...queryKeys.epoch(params), "tournament"] as const,
    detail: (params: MatchDetailParam) =>
        [...queryKeys.tournament(params), "match", params.matchId] as const,
    subTournament: (params: MatchDetailParam) =>
        [
            ...queryKeys.epoch(params),
            "match",
            params.matchId,
            "subTournament",
        ] as const,
    match: (params: MatchParams) =>
        [
            ...queryKeys.tournament(params),
            params.tournamentId,
            "match",
            params.matchId,
        ] as const,
};

export const matchQueryKeys = queryKeys;

// FETCHERS

type GetMatchDetailsReturn = ReturnType<typeof findMatch>;

const getMatchDetails = (params: MatchDetailParam) => {
    const promise = new Promise<{ match: GetMatchDetailsReturn }>((resolve) => {
        setTimeout(() => {
            const match = findMatch({
                applicationId: params.applicationId,
                epochIndex: params.epochIndex,
                matchId: params.matchId,
            });

            resolve({ match });
        }, NETWORK_DELAY);
    });

    return promise;
};

type FetchMatchReturn = ReturnType<typeof getMatch>;
const fetchMatch = async (client: CartesiPublicClient, params: MatchParams) => {
    const match = await client.getMatch({
        application: params.applicationId,
        epochIndex: BigInt(params.epochIndex),
        tournamentAddress: params.tournamentId,
        idHash: params.matchId,
    });
    return { match: await getMatch_(client, params.applicationId, match) };
};

type GetMatchTournamentReturn = ReturnType<typeof findMatchTournament>;

const getMatchTournament = async (
    client: CartesiPublicClient,
    params: MatchDetailParam,
) => {
    // get epoch
    const epoch = await client.getEpoch({
        application: params.applicationId,
        epochIndex: BigInt(params.epochIndex),
    });

    if (!epoch.tournamentAddress) {
        return { tournament: null };
    }
    
    // get top tournament
    const top = await client.getTournament({
        address: epoch.tournamentAddress,
        application: params.applicationId,
    });

    // get match of top tournament
    // XXX: assumes query match is top tournament
    const match = await client.getMatch({
        application: params.applicationId,
        epochIndex: BigInt(params.epochIndex),
        tournamentAddress: top.address,
        idHash: params.matchId,
    });

    // get sub-tournament
    // XXX: for now get all tournaments of epoch, while there is no way to get mid-tournament of a match
    const epochTournaments = await client.listTournaments({
        application: params.applicationId,
        epochIndex: BigInt(params.epochIndex),
    });
    const subTournament = epochTournaments.data.find(
        (tournament) =>
            tournament.parentTournamentAddress === match.tournamentAddress,
    );
    if (subTournament) {
        return {
            tournament: await getTournament(
                client,
                params.applicationId,
                subTournament.address,
            ),
        };
    }
    return { tournament: null };
};

// CUSTOM HOOKS

const createActions = (
    match: CartesiMatch,
    advances: MatchAdvanced[],
): MatchAction[] => {
    return advances.map((matchAdvanced, index, array) => {
        // direction is defined whether the parent of the advance is the left node of the previous advance, otherwise it's the right node
        const left = index === 0 ? match.leftOfTwo : array[index - 1].leftNode;
        const direction = matchAdvanced.otherParent === left ? 0 : 1;
        return {
            type: "advance",
            direction,
            timestamp: matchAdvanced.updatedAt.getTime(),
        };
    });
};

const getMatch_ = async (
    client: CartesiPublicClient,
    application: Address | string,
    match: CartesiMatch,
): Promise<Match> => {
    // list all match advances
    const advances = await client.listMatchAdvances({
        application,
        epochIndex: match.epochIndex,
        idHash: match.idHash,
        tournamentAddress: match.tournamentAddress,
    });
    // XXX: handle pagination (get all pages)
    // create advance actions
    const actions = createActions(match, advances.data);

    // get sub-tournament
    // XXX: for now get all tournaments of epoch, while there is no way to get mid-tournament of a match
    const epochTournaments = await client.listTournaments({
        application,
        epochIndex: match.epochIndex,
    });
    let tournament: Tournament | null = null;
    const subTournament = epochTournaments.data.find(
        (tournament) =>
            tournament.parentTournamentAddress === match.tournamentAddress,
    );
    if (subTournament) {
        // call "recursively" to get sub-tournament
        tournament = await getTournament(
            client,
            application,
            subTournament.address,
        );
        if (tournament) {
            actions.push({
                type: "match_sealed_inner_tournament_created",
                range: [0, 0],
                timestamp: actions[actions.length - 1].timestamp,
            });
        }
    }

    // XXX: handle pagination (get all pages)
    return {
        id: match.idHash,
        claim1: { hash: match.commitmentOne },
        claim2: { hash: match.commitmentTwo },
        actions,
        timestamp: match.updatedAt.getTime(),
        tournament: tournament ?? undefined,
        winner:
            match.winnerCommitment === match.commitmentOne
                ? 1
                : match.winnerCommitment === match.commitmentTwo
                  ? 2
                  : undefined,
        // XXX: winnerTimestamp
    };
};

const getMatches = async (
    client: CartesiPublicClient,
    application: Address | string,
    address: Address,
): Promise<Match[]> => {
    // get the tournament matches
    const matches = await client.listMatches({
        application,
        tournamentAddress: address,
    });
    // XXX: handle pagination (get all pages)
    return Promise.all(
        matches.data.map((match) => getMatch_(client, application, match)),
    );
};

const getTournament = async (
    client: CartesiPublicClient,
    application: Address | string,
    address: Address,
): Promise<Tournament | null> => {
    try {
        // first get the tournament
        const tournament = await client.getTournament({ application, address });

        // now get the tournament matches
        const matches = await getMatches(client, application, address);

        // XXX: find the dangling claim

        return {
            id: tournament.address,
            startCycle: 0,
            endCycle: 0,
            height: Number(tournament.height),
            level:
                tournament.level === 0n
                    ? "top"
                    : tournament.level === 1n
                      ? "middle"
                      : "bottom",
            matches,
            danglingClaim: undefined,
            winner: tournament.winnerCommitment
                ? { hash: tournament.winnerCommitment }
                : undefined,
        };
    } catch (e: unknown) {
        return null;
    }
};

export const useGetMatch = (params: MatchDetailParam) => {
    const client = useCartesiClient();

    const epochQuery = useEpoch({
        application: params.applicationId,
        epochIndex: BigInt(params.epochIndex),
    });

    const matchQuery = useMatch({
        application: params.applicationId,
        epochIndex: BigInt(params.epochIndex),
        tournamentAddress: epochQuery.data?.tournamentAddress ?? undefined,
        idHash: params.matchId,
    });

    const [match, setMatch] = useState<Match | null>(null);
    useEffect(() => {
        if (matchQuery.data) {
            getMatch_(client, params.applicationId, matchQuery.data).then(
                setMatch,
            );
        }
    }, [matchQuery.data]);

    return {
        isLoading: epochQuery.isLoading || matchQuery.isLoading,
        data: { match },
    };
};

interface UseFindMatchParams extends MatchDetailParam {
    tournamentId: Hex;
    enabled?: boolean;
}

export const useFindMatch = (params: UseFindMatchParams) => {
    const client = useCartesiClient();
    return useQuery({
        queryKey: queryKeys.match(params),
        queryFn: () => fetchMatch(client, omit(["enabled"], params)),
        enabled: params.enabled ?? true,
    });
};

export const useGetMatchTournament = (params: MatchDetailParam) => {
    const client = useCartesiClient();
    return useQuery({
        queryKey: queryKeys.subTournament(params),
        queryFn: () => getMatchTournament(client, params),
    });
};
