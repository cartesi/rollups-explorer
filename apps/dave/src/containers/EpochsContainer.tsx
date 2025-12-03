import { useEpochs } from "@cartesi/wagmi";
import { Stack } from "@mantine/core";
import type { FC } from "react";
import { useParams } from "react-router";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { EpochsPage } from "../pages/EpochsPage";
import {
    routePathBuilder,
    type ApplicationParams,
} from "../routes/routePathBuilder";
import { ContainerSkeleton } from "./ContainerSkeleton";

export const EpochsContainer: FC = () => {
    const params = useParams<ApplicationParams>();
    const { isLoading, data } = useEpochs(params);
    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: "/" },
        {
            title: params.application,
            href: routePathBuilder.epochs({
                application: params.application ?? "",
            }),
        },
    ];

    const epochs = data?.data ?? [];

    return (
        <Stack pt="lg" gap="lg">
            <Hierarchy hierarchyConfig={hierarchyConfig} />
            {isLoading && <ContainerSkeleton />}
            {params.application && (
                <EpochsPage application={params.application} epochs={epochs} />
            )}
        </Stack>
    );
};
