"use client";
import { useEpochs } from "@cartesi/wagmi";
import type { FC } from "react";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { EpochsPage } from "../page/EpochsPage";
import { pathBuilder } from "../routes/routePathBuilder";
import { ContainerSkeleton } from "./ContainerSkeleton";
import ContainerStack from "./ContainerStack";

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
            href: pathBuilder.application(props),
        },
        {
            title: "epochs",
            href: pathBuilder.epochs(props),
        },
    ];

    const epochs = data?.data ?? [];

    return (
        <ContainerStack>
            <Hierarchy hierarchyConfig={hierarchyConfig} />
            {isLoading && <ContainerSkeleton />}
            {props.application && (
                <EpochsPage epochs={epochs} pagination={data?.pagination} />
            )}
        </ContainerStack>
    );
};
