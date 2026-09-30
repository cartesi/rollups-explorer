"use client";
import {
    useBondEvents,
    useCommitment,
    useCommitments,
    useMatch,
    useMatches,
    useTournament,
} from "@cartesi/react";
import { notFound } from "next/navigation";
import { isNotNil } from "ramda";
import type { FC } from "react";
import { useBalance } from "wagmi";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { MatchBreadcrumbSegment } from "../components/navigation/MatchBreadcrumbSegment";
import { TournamentBreadcrumbSegment } from "../components/navigation/TournamentBreadcrumbSegment";
import { useJoinBonds } from "../hooks/useJoinBonds";
import { useRefetchOnFinalizedBlock } from "../hooks/useRefetchOnFinalizedBlock";
import { useTournamentHierarchy } from "../hooks/useTournamentHierarchy";
import { isTournamentSettled } from "../lib/prtUtils";
import { TournamentPage } from "../page/TournamentPage";
import { pathBuilder, type TournamentParams } from "../routes/routePathBuilder";
import { ContainerSkeleton } from "./ContainerSkeleton";
import ContainerStack from "./ContainerStack";

export const TournamentContainer: FC<TournamentParams> = (params) => {
    const tournamentQuery = useTournament({
        application: params.application,
        address: params.tournamentAddress,
    });
    const { data: tournament, isLoading } = tournamentQuery;

    const matchesQuery = useMatches(params);
    const matches = matchesQuery.data;

    const commitmentsQuery = useCommitments(params);
    const commitments = commitmentsQuery.data;

    const bondEventsQuery = useBondEvents({
        application: params.application,
        epochIndex: params.epochIndex,
        tournamentAddress: params.tournamentAddress,
        limit: 10_000,
        descending: true,
    });

    const joinBonds = useJoinBonds(tournament, commitments?.data ?? []);

    const parentTournamentAddress = tournament?.parentTournamentAddress;
    const parentMatchQuery = useMatch({
        application: params.application,
        epochIndex: params.epochIndex,
        tournamentAddress: parentTournamentAddress ?? undefined,
        idHash: tournament?.parentMatchIdHash ?? undefined,
        enabled: isNotNil(parentTournamentAddress),
    });
    const parentCommitment = tournament?.snapshot.innerResult?.parentCommitment;
    const parentCommitmentQuery = useCommitment({
        application: params.application,
        epochIndex: params.epochIndex,
        tournamentAddress: parentTournamentAddress ?? undefined,
        commitment: parentCommitment ?? undefined,
        enabled:
            isNotNil(parentTournamentAddress) && isNotNil(parentCommitment),
    });
    const parentJoin = useJoinBonds(
        parentTournamentAddress ? { address: parentTournamentAddress } : null,
        parentCommitmentQuery.data ? [parentCommitmentQuery.data] : [],
    );
    const balanceQuery = useBalance({
        address: tournament?.address,
        query: { enabled: isNotNil(tournament) },
    });

    useRefetchOnFinalizedBlock(
        isNotNil(tournament) && !isTournamentSettled(tournament),
        [
            tournamentQuery.refetch,
            matchesQuery.refetch,
            commitmentsQuery.refetch,
            bondEventsQuery.refetch,
            balanceQuery.refetch,
            parentMatchQuery.refetch,
        ],
    );

    // tournament hierarchy
    const { matches: parentMatches, tournaments: parentTournaments } =
        useTournamentHierarchy({
            application: params.application,
            epochIndex: params.epochIndex,
            tournament: tournament,
        });
    const h = parentTournaments.flatMap((tournament, index) => {
        return [
            {
                title: (
                    <TournamentBreadcrumbSegment
                        level={tournament.level}
                        variant="default"
                    />
                ),
                href: pathBuilder.tournament({
                    application: params.application,
                    epochIndex: params.epochIndex,
                    tournamentAddress: tournament.address,
                }),
            },
            {
                title: (
                    <MatchBreadcrumbSegment
                        match={parentMatches[index]}
                        variant="default"
                    />
                ),
                href: pathBuilder.match({
                    application: params.application,
                    epochIndex: params.epochIndex,
                    tournamentAddress: tournament.address,
                    idHash: parentMatches[index].idHash,
                }),
            },
        ];
    });

    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: "/" },
        {
            title: params.application,
            href: pathBuilder.application(params),
        },
        {
            title: "epochs",
            href: pathBuilder.epochs(params),
        },
        {
            title: `Epoch #${params.epochIndex}`,
            href: pathBuilder.epoch({
                application: params.application,
                epochIndex: params.epochIndex,
            }),
        },
        ...h,
        {
            title: (
                <TournamentBreadcrumbSegment
                    level={tournament?.level ?? 0n}
                    variant="filled"
                />
            ),
            href: pathBuilder.tournament({
                application: params.application,
                epochIndex: params.epochIndex,
                tournamentAddress: tournament?.address ?? "0x",
            }),
        },
    ];

    if (!isLoading && !tournament) {
        return notFound();
    }

    return (
        <ContainerStack>
            <Hierarchy hierarchyConfig={hierarchyConfig} />
            {isLoading && <ContainerSkeleton />}
            {!!tournament && (
                <TournamentPage
                    bondEvents={bondEventsQuery.data?.data}
                    bondPool={{
                        balance: balanceQuery.data?.value,
                        bondValue: joinBonds.bondValue,
                        bonds: [...joinBonds.bonds.values()],
                        loading: joinBonds.isLoading || balanceQuery.isPending,
                    }}
                    parent={{
                        match: parentMatchQuery.data,
                        winnerChildren: parentCommitment
                            ? parentJoin.bonds.get(parentCommitment)?.children
                            : undefined,
                        winnerChildrenLoading:
                            parentCommitmentQuery.isLoading ||
                            parentJoin.isLoading,
                        onActionConfirmed: () => {
                            tournamentQuery.refetch();
                            parentMatchQuery.refetch();
                        },
                    }}
                    onBondRecovered={() => {
                        tournamentQuery.refetch();
                        bondEventsQuery.refetch();
                        balanceQuery.refetch();
                    }}
                    commitments={commitments?.data ?? []}
                    matches={matches?.data ?? []}
                    tournament={tournament}
                />
            )}
        </ContainerStack>
    );
};
