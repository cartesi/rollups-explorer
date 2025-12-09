"use client";
import { useEpochs } from "@cartesi/wagmi";
import { Stack } from "@mantine/core";
import type { FC } from "react";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { EpochsPage } from "../page/EpochsPage";
import { ContainerSkeleton } from "./ContainerSkeleton";

export type EpochsContainerProps = {
    application: string;
    descending?: boolean;
    limit?: number;
    offset?: number;
};

export const EpochsContainer: FC<EpochsContainerProps> = (props) => {
    const { isLoading, data } = useEpochs(props);
    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: "/" },
        {
            title: props.application,
            href: `apps/${props.application}/epochs`,
        },
    ];

    const epochs = data?.data ?? [];

    return (
        <Stack pt="lg" gap="lg">
            <Hierarchy hierarchyConfig={hierarchyConfig} />
            {isLoading && <ContainerSkeleton />}
            {props.application && (
                <EpochsPage epochs={epochs} pagination={data?.pagination} />
            )}
        </Stack>
    );
};
