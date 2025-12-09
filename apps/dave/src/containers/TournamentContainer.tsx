"use client";
import { useCommitments, useMatches, useTournament } from "@cartesi/wagmi";
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
import { TournamentPage } from "../page/TournamentPage";
import {
    routePathBuilder,
    type TournamentParams,
} from "../routes/routePathBuilder";
import { ContainerSkeleton } from "./ContainerSkeleton";

export const TournamentContainer: FC<TournamentParams> = (params) => {
    const { data: tournament, isLoading } = useTournament({
        application: params.application,
        address: params.tournamentAddress,
    });

    // fetch tournament matches
    const { data: matches } = useMatches(params);

    // fetch tournament commitments
    const { data: commitments } = useCommitments(params);

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
                href: routePathBuilder.tournament({
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
                href: routePathBuilder.match({
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
            href: routePathBuilder.epochs({ application: params.application }),
        },
        {
            title: `Epoch #${params.epochIndex}`,
            href: routePathBuilder.epoch({
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
            href: routePathBuilder.tournament({
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
        <Stack pt="lg" gap="lg">
            <Hierarchy hierarchyConfig={hierarchyConfig} />
            {isLoading && <ContainerSkeleton />}
            {!!tournament && (
                <TournamentPage
                    commitments={commitments?.data ?? []}
                    matches={matches?.data ?? []}
                    tournament={tournament}
                />
            )}
        </Stack>
    );
};
