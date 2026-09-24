"use client";
import {
    useBondEvents,
    useCommitments,
    useMatches,
    useTournament,
} from "@cartesi/react";
import { notFound } from "next/navigation";
import { isNotNil } from "ramda";
import type { FC } from "react";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { MatchBreadcrumbSegment } from "../components/navigation/MatchBreadcrumbSegment";
import { TournamentBreadcrumbSegment } from "../components/navigation/TournamentBreadcrumbSegment";
import { useRefetchOnFinalizedBlock } from "../hooks/useRefetchOnFinalizedBlock";
import { useTournamentHierarchy } from "../hooks/useTournamentHierarchy";
import { isBondRecovery } from "../lib/bondUtils";
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

    const bondRecoveryQuery = useBondEvents({
        application: params.application,
        epochIndex: params.epochIndex,
        tournamentAddress: params.tournamentAddress,
        descending: true,
        limit: 10,
        enabled: tournament?.snapshot.bondRecovery.disposition === "RECOVERED",
    });
    const bondRecovery = bondRecoveryQuery.data?.data.find(isBondRecovery);

    useRefetchOnFinalizedBlock(
        isNotNil(tournament) && !isTournamentSettled(tournament),
        [
            tournamentQuery.refetch,
            matchesQuery.refetch,
            commitmentsQuery.refetch,
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
                    bondRecovery={bondRecovery}
                    commitments={commitments?.data ?? []}
                    matches={matches?.data ?? []}
                    tournament={tournament}
                />
            )}
        </ContainerStack>
    );
};
