import {
    useCommitments,
    useEpoch,
    useMatches,
    useTournament,
    useTournaments,
} from "@cartesi/wagmi";
import type { Hex } from "viem";
import type { Tournament } from "../components/types";

interface EpochDetailParam {
    applicationId: string | Hex;
    epochIndex: number;
}

const queryKeys = {
    all: () => ["epochs"] as const,
    details: (appId: string | Hex) =>
        [...queryKeys.all(), "app", appId, "epoch"] as const,
    detail: ({ applicationId, epochIndex }: EpochDetailParam) =>
        [...queryKeys.details(applicationId), epochIndex] as const,
    tournament: (params: EpochDetailParam) =>
        [...queryKeys.detail(params), "tournament"] as const,
};

export const epochQueryKeys = queryKeys;

// CUSTOM HOOKS

export const useGetEpochTournament = (params: EpochDetailParam) => {
    const epochQuery = useEpoch({
        application: params.applicationId,
        epochIndex: BigInt(params.epochIndex),
    });

    const tournamentQuery = useTournament({
        application: params.applicationId,
        address: epochQuery.data?.tournamentAddress ?? undefined,
    });

    const commitmentsQuery = useCommitments({
        application: params.applicationId,
        tournamentAddress: epochQuery.data?.tournamentAddress ?? undefined,
    });

    const matchesQuery = useMatches({
        application: params.applicationId,
        tournamentAddress: epochQuery.data?.tournamentAddress ?? undefined,
    });

    // XXX: get all tournaments of epoch, while there is no way to get mid-tournament of a match
    const midTournamentQuery = useTournaments({
        application: params.applicationId,
        epochIndex: BigInt(params.epochIndex),
    });

    const tournament: Tournament | null = tournamentQuery.data
        ? {
              id: tournamentQuery.data.address,
              startCycle: 0,
              endCycle: 0,
              height: Number(tournamentQuery.data.height),
              level:
                  tournamentQuery.data.level === 0n
                      ? "top"
                      : tournamentQuery.data.level === 1n
                        ? "middle"
                        : "bottom",
              matches:
                  matchesQuery.data?.data.map((match) => ({
                      actions: [], // XXX: comes from advances?
                      claim1: { hash: match.commitmentOne },
                      claim2: { hash: match.commitmentTwo },
                      id: match.idHash,
                      timestamp: match.updatedAt.getTime() / 1000,
                      winner: match.winnerCommitment
                          ? match.winnerCommitment === match.commitmentOne
                              ? 1
                              : 2
                          : undefined,
                  })) ?? [],
              danglingClaim: undefined,
              winner: tournamentQuery.data?.winnerCommitment
                  ? { hash: tournamentQuery.data.winnerCommitment }
                  : undefined,
          }
        : null;

    return {
        isLoading:
            epochQuery.isLoading ||
            tournamentQuery.isLoading ||
            commitmentsQuery.isLoading ||
            matchesQuery.isLoading,
        data: { tournament },
    };
};
