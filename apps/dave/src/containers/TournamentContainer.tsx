import { useCommitments, useMatches, useTournament } from "@cartesi/wagmi";
import { Group, Stack, Text } from "@mantine/core";
import type { FC } from "react";
import { useParams } from "react-router";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { NotFound } from "../components/navigation/NotFound";
import { TournamentBreadcrumbSegment } from "../components/navigation/TournamentBreadcrumbSegment";
import { TournamentPage } from "../pages/TournamentPage";
import {
    routePathBuilder,
    type TournamentParams,
} from "../routes/routePathBuilder";
import { ContainerSkeleton } from "./ContainerSkeleton";

export const TournamentContainer: FC = () => {
    const params = useParams<TournamentParams>();
    const applicationId = params.application ?? "";
    const parsedIndex = parseInt(params.epochIndex ?? "");
    const epochIndex = isNaN(parsedIndex) ? -1 : parsedIndex;

    const { data: tournament, isLoading } = useTournament({
        application: applicationId,
        address: params.tournamentAddress,
    });

    // fetch tournament matches
    const { data: matches } = useMatches({
        application: applicationId,
        epochIndex: BigInt(epochIndex),
        tournamentAddress: params.tournamentAddress,
    });

    // fetch tournament commitments
    const { data: commitments } = useCommitments({
        application: applicationId,
        epochIndex: BigInt(epochIndex),
        tournamentAddress: params.tournamentAddress,
    });

    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: "/" },
        {
            title: params.application,
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
            title: <TournamentBreadcrumbSegment level={0n} variant="filled" />,
            href: routePathBuilder.tournament({
                application: applicationId,
                epochIndex: epochIndex.toString(),
                tournamentAddress: params.tournamentAddress ?? "0x",
            }),
        },
    ];

    return (
        <Stack pt="lg" gap="lg">
            <Hierarchy hierarchyConfig={hierarchyConfig} />

            {isLoading ? (
                <ContainerSkeleton />
            ) : !!tournament ? (
                <TournamentPage
                    commitments={commitments?.data ?? []}
                    matches={matches?.data ?? []}
                    tournament={tournament}
                />
            ) : (
                <NotFound>
                    <Stack gap={2}>
                        <Text c="dimmed" fw="bold">
                            We're not able to find the tournament
                        </Text>
                        <Group gap={3}>
                            <Text c="dimmed">for application</Text>
                            <Text c="orange">{applicationId}</Text>
                            <Text c="dimmed">at epoch</Text>
                            <Text c="orange">{params.epochIndex}</Text>
                        </Group>
                    </Stack>
                </NotFound>
            )}
        </Stack>
    );
};
