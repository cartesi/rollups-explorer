import { useEpoch, useInputs } from "@cartesi/wagmi";
import { Group, Stack, Text } from "@mantine/core";
import { type FC } from "react";
import { useParams } from "react-router";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { NotFound } from "../components/navigation/NotFound";
import { EpochDetailsPage } from "../pages/EpochDetailsPage";
import { routePathBuilder, type EpochParams } from "../routes/routePathBuilder";
import { ContainerSkeleton } from "./ContainerSkeleton";

export const EpochContainer: FC = () => {
    const params = useParams<EpochParams>();
    const epochIndex = BigInt(params.epochIndex ?? "0");

    const { data: epoch, isLoading: isEpochLoading } = useEpoch({
        application: params.application,
        epochIndex: epochIndex,
    });

    const { data: inputs, isLoading: isInputsLoading } = useInputs({
        application: params.application,
        epochIndex,
    });

    const isLoading = isEpochLoading || isInputsLoading;

    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: "/" },
        {
            title: params.application,
            href: routePathBuilder.epochs({
                application: params.application ?? "",
            }),
        },
        {
            title: `Epoch #${params.epochIndex}`,
            href: routePathBuilder.epoch({
                application: params.application ?? "",
                epochIndex: params.epochIndex ?? "",
            }),
        },
    ];

    return (
        <Stack pt="lg" gap="lg">
            <Hierarchy hierarchyConfig={hierarchyConfig} />

            {isLoading && <ContainerSkeleton />}
            {!!epoch && (
                <EpochDetailsPage epoch={epoch} inputs={inputs?.data ?? []} />
            )}
            {!isLoading && !epoch && (
                <NotFound>
                    <Group gap={3}>
                        <Text c="dimmed">We're not able to find the epoch</Text>
                        <Text c="orange">{params.epochIndex}</Text>
                        <Text c="dimmed">for application</Text>
                        <Text c="orange">{params.application}</Text>
                    </Group>
                </NotFound>
            )}
        </Stack>
    );
};
