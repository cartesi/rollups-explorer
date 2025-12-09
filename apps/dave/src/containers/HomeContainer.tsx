"use client";

import { useApplications } from "@cartesi/wagmi";
import { Stack } from "@mantine/core";
import type { FC } from "react";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { HomePage } from "../page/HomePage";
import { ContainerSkeleton } from "./ContainerSkeleton";

export type HomeContainerProps = {
    descending?: boolean;
    limit?: number;
    offset?: number;
};

export const HomeContainer: FC<HomeContainerProps> = (props) => {
    const { data, isLoading } = useApplications(props);
    const hierarchyConfig: HierarchyConfig[] = [{ title: "Home", href: "/" }];
    const applications = data?.data ?? [];

    return (
        <Stack pt="lg" gap="lg">
            <Hierarchy hierarchyConfig={hierarchyConfig} />

            {isLoading ? (
                <ContainerSkeleton />
            ) : (
                <HomePage applications={applications} />
            )}
        </Stack>
    );
};
