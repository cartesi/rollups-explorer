import { useMatch, useMatchAdvances, useTournament } from "@cartesi/wagmi";
import { Group, Stack, Text, Title } from "@mantine/core";
import { getUnixTime } from "date-fns";
import type { FC } from "react";
import { useParams } from "react-router";
import { type Hex } from "viem";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { MatchBreadcrumbSegment } from "../components/navigation/MatchBreadcrumbSegment";
import { NotFound } from "../components/navigation/NotFound";
import { TournamentBreadcrumbSegment } from "../components/navigation/TournamentBreadcrumbSegment";
import { MatchPage } from "../pages/MatchPage";
import { routePathBuilder, type MatchParams } from "../routes/routePathBuilder";
import { ContainerSkeleton } from "./ContainerSkeleton";

export const MatchContainer: FC = () => {
    const params = useParams<MatchParams>();
    const applicationId = params.application ?? "";
    const parsedIndex = parseInt(params.epochIndex ?? "");
    const epochIndex = isNaN(parsedIndex) ? -1 : parsedIndex;
    const matchId = (params.matchId ?? "0x") as Hex;
    const nowUnixtime = getUnixTime(new Date());

    const tournamentQuery = useTournament({
        application: applicationId,
        address: params.tournamentAddress,
    });

    const matchQuery = useMatch({
        application: applicationId,
        epochIndex: BigInt(epochIndex),
        tournamentAddress: params.tournamentAddress,
        idHash: matchId,
    });

    const advancesQuery = useMatchAdvances({
        application: applicationId,
        epochIndex: BigInt(epochIndex),
        tournamentAddress: params.tournamentAddress,
        idHash: matchId,
    });

    const isLoading =
        tournamentQuery.isLoading ||
        matchQuery.isLoading ||
        advancesQuery.isLoading;
    const match = matchQuery.data ?? null;
    const tournament = tournamentQuery.data ?? null;

    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: "/" },
        {
            title: applicationId,
            href: routePathBuilder.epochs({ application: applicationId }),
        },
        {
            title: `Epoch #${params.epochIndex}`,
            href: routePathBuilder.epoch({
                application: applicationId,
                epochIndex: epochIndex.toString(),
            }),
        },
        {
            title: <TournamentBreadcrumbSegment level={0n} variant="default" />,
            href: routePathBuilder.tournament({
                application: applicationId,
                epochIndex: epochIndex.toString(),
                tournamentAddress: params.tournamentAddress ?? "0x",
            }),
        },
        {
            title: <MatchBreadcrumbSegment match={match} variant="filled" />,
            href: routePathBuilder.match({
                application: applicationId,
                epochIndex: epochIndex.toString(),
                tournamentAddress: params.tournamentAddress ?? "0x",
                matchId,
            }),
        },
    ];

    return (
        <Stack pt="lg" gap="lg">
            <Hierarchy hierarchyConfig={hierarchyConfig} />

            {isLoading ? (
                <ContainerSkeleton />
            ) : tournament !== null && match !== null ? (
                <MatchPage
                    advances={advancesQuery.data?.data ?? []}
                    tournament={tournament}
                    match={match}
                    now={nowUnixtime}
                />
            ) : (
                <NotFound>
                    <Stack gap={2} align="center">
                        <Title c="dimmed" fw="bold" order={3}>
                            We're not able to find details about match{" "}
                            <Text c="orange" inherit component="span">
                                {params.matchId}
                            </Text>
                        </Title>

                        <Group gap={3}>
                            <Text c="dimmed">in application</Text>
                            <Text c="orange">{params.application}</Text>
                            <Text c="dimmed">at epoch</Text>
                            <Text c="orange">{params.epochIndex}</Text>
                        </Group>
                    </Stack>
                </NotFound>
            )}
        </Stack>
    );
};
