"use client";
import {
    useMatch,
    useMatchAdvances,
    useTournament,
    useTournaments,
} from "@cartesi/wagmi";
import { Stack } from "@mantine/core";
import { notFound } from "next/navigation";
import type { FC } from "react";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { MatchBreadcrumbSegment } from "../components/navigation/MatchBreadcrumbSegment";
import { TournamentBreadcrumbSegment } from "../components/navigation/TournamentBreadcrumbSegment";
import { useTournamentHierarchy } from "../hooks/useTournamentHierarchy";
import { MatchPage } from "../page/MatchPage";
import { pathBuilder, type MatchParams } from "../routes/routePathBuilder";
import { ContainerSkeleton } from "./ContainerSkeleton";

export const MatchContainer: FC<MatchParams> = (params) => {
    const now = Date.now();

    const tournamentQuery = useTournament({
        application: params.application,
        address: params.tournamentAddress,
    });

    const matchQuery = useMatch(params);
    const advancesQuery = useMatchAdvances(params);
    const subTournamentQuery = useTournaments({
        ...params,
        parentTournamentAddress: params.tournamentAddress,
        parentMatchIdHash: params.idHash,
    });

    const isLoading =
        tournamentQuery.isLoading ||
        matchQuery.isLoading ||
        advancesQuery.isLoading ||
        subTournamentQuery.isLoading;
    const match = matchQuery.data ?? null;
    const tournament = tournamentQuery.data ?? null;
    const subTournament = subTournamentQuery.data?.data[0];

    const { matches: parentMatches, tournaments: parentTournaments } =
        useTournamentHierarchy({
            application: params.application,
            epochIndex: params.epochIndex,
            tournament: tournamentQuery?.data,
        });

    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: "/" },
        {
            title: params.application,
            href: pathBuilder.epochs(params),
        },
        {
            title: `Epoch #${params.epochIndex}`,
            href: pathBuilder.epoch(params),
        },
        ...parentTournaments.flatMap((tournament, index) => {
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
        }),
        {
            title: (
                <TournamentBreadcrumbSegment
                    level={tournament?.level ?? 0n}
                    variant="default"
                />
            ),
            href: pathBuilder.tournament(params),
        },
        {
            title: <MatchBreadcrumbSegment match={match} variant="filled" />,
            href: pathBuilder.match(params),
        },
    ];

    if (!isLoading && !tournament && !match) {
        return notFound();
    }

    return (
        <Stack pt="lg" gap="lg">
            <Hierarchy hierarchyConfig={hierarchyConfig} />
            {isLoading && <ContainerSkeleton />}
            {tournament !== null && match !== null && (
                <MatchPage
                    advances={advancesQuery.data?.data ?? []}
                    tournament={tournament}
                    subTournament={subTournament}
                    match={match}
                    now={now}
                />
            )}
        </Stack>
    );
};
