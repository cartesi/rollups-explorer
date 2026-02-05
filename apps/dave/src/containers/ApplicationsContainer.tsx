"use client";

import { useApplications } from "@cartesi/wagmi";
import type { FC } from "react";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { ApplicationsPage } from "../page/ApplicationsPage";
import { ContainerSkeleton } from "./ContainerSkeleton";
import ContainerStack from "./ContainerStack";

export type HomeContainerProps = {
    descending?: boolean;
    limit?: number;
    offset?: number;
};

export const ApplicationsContainer: FC<HomeContainerProps> = (props) => {
    const { data, isLoading } = useApplications(props);
    const hierarchyConfig: HierarchyConfig[] = [{ title: "Home", href: "/" }];
    const applications = data?.data ?? [];

    return (
        <ContainerStack>
            <Hierarchy hierarchyConfig={hierarchyConfig} />

            {isLoading ? (
                <ContainerSkeleton />
            ) : (
                <ApplicationsPage
                    applications={applications}
                    pagination={data?.pagination}
                />
            )}
        </ContainerStack>
    );
};
