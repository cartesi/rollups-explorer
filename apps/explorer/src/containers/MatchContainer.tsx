"use client";
import {
    useBondEvents,
    useCommitment,
    useMatch,
    useMatchAdvances,
    useTournament,
    useTournaments,
} from "@cartesi/react";
import { notFound } from "next/navigation";
import { isNotNil } from "ramda";
import { useMemo, type FC } from "react";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { MatchBreadcrumbSegment } from "../components/navigation/MatchBreadcrumbSegment";
import { TournamentBreadcrumbSegment } from "../components/navigation/TournamentBreadcrumbSegment";
import { useBlockTimestamps } from "../hooks/useBlockTimestamps";
import { useRefetchOnFinalizedBlock } from "../hooks/useRefetchOnFinalizedBlock";
import { useTournamentHierarchy } from "../hooks/useTournamentHierarchy";
import { isBondRefund } from "../lib/bondUtils";
import { isTournamentSettled } from "../lib/prtUtils";
import { MatchPage } from "../page/MatchPage";
import { pathBuilder, type MatchParams } from "../routes/routePathBuilder";
import { ContainerSkeleton } from "./ContainerSkeleton";
import ContainerStack from "./ContainerStack";

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

    const commitmentParams = {
        application: params.application,
        epochIndex: params.epochIndex,
        tournamentAddress: params.tournamentAddress,
    };
    const commitmentOneQuery = useCommitment({
        ...commitmentParams,
        commitment: matchQuery.data?.commitmentOne,
        enabled: isNotNil(matchQuery.data),
    });
    const commitmentTwoQuery = useCommitment({
        ...commitmentParams,
        commitment: matchQuery.data?.commitmentTwo,
        enabled: isNotNil(matchQuery.data),
    });
    const commitments = [
        commitmentOneQuery.data,
        commitmentTwoQuery.data,
    ].filter(isNotNil);

    const bondEventsQuery = useBondEvents({
        application: params.application,
        epochIndex: params.epochIndex,
        tournamentAddress: params.tournamentAddress,
        limit: 10_000,
        descending: true,
    });
    const refunds = useMemo(
        () =>
            new Map(
                (bondEventsQuery.data?.data ?? [])
                    .filter(isBondRefund)
                    .map((refund) => [refund.txHash, refund]),
            ),
        [bondEventsQuery.data],
    );

    useRefetchOnFinalizedBlock(
        isNotNil(tournamentQuery.data) &&
            !isTournamentSettled(tournamentQuery.data),
        [
            tournamentQuery.refetch,
            matchQuery.refetch,
            advancesQuery.refetch,
            subTournamentQuery.refetch,
            commitmentOneQuery.refetch,
            commitmentTwoQuery.refetch,
            bondEventsQuery.refetch,
        ],
    );

    const isLoading =
        tournamentQuery.isLoading ||
        matchQuery.isLoading ||
        advancesQuery.isLoading ||
        subTournamentQuery.isLoading;
    const match = matchQuery.data ?? null;
    const tournament = tournamentQuery.data ?? null;
    const subTournament = subTournamentQuery.data?.data[0];

    const { timestamps, isLoading: timestampsLoading } = useBlockTimestamps([
        ...(advancesQuery.data?.data ?? []).map(
            ({ blockNumber }) => blockNumber,
        ),
        match?.deletionBlockNumber,
        subTournament?.startInstant,
    ]);

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
            href: pathBuilder.application(params),
        },
        {
            title: "epochs",
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
        <ContainerStack>
            <Hierarchy hierarchyConfig={hierarchyConfig} />
            {isLoading && <ContainerSkeleton />}
            {tournament !== null && match !== null && (
                <MatchPage
                    advances={advancesQuery.data?.data ?? []}
                    commitments={commitments}
                    tournament={tournament}
                    refunds={refunds}
                    subTournament={subTournament}
                    timestamps={timestamps}
                    timestampsLoading={timestampsLoading}
                    match={match}
                    now={now}
                />
            )}
        </ContainerStack>
    );
};
