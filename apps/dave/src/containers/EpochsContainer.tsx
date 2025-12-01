import { useEpochs } from "@cartesi/wagmi";
import { Stack } from "@mantine/core";
import type { FC } from "react";
import { useParams } from "react-router";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { EpochsPage } from "../pages/EpochsPage";
import { routePathBuilder } from "../routes/routePathBuilder";
import { ContainerSkeleton } from "./ContainerSkeleton";

export const EpochsContainer: FC = () => {
    const params = useParams();
    const appId = params.appId ?? "";
    const { isLoading, data } = useEpochs({ application: appId });
    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: "/" },
        { title: appId, href: routePathBuilder.appEpochs(params) },
    ];

    const epochs = data?.data ?? [];

    return (
        <Stack pt="lg" gap="lg">
            <Hierarchy hierarchyConfig={hierarchyConfig} />

            {isLoading ? (
                <ContainerSkeleton />
            ) : (
                <EpochsPage epochs={epochs} appId={appId} />
            )}
        </Stack>
    );
};
