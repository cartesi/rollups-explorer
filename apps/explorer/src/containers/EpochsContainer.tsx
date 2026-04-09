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
import DisplayContainerError from "./DisplayContainerError";

export type EpochsContainerProps = {
    application: string;
    descending?: boolean;
    limit?: number;
    offset?: number;
};

export const EpochsContainer: FC<EpochsContainerProps> = (props) => {
    const { isLoading, data, error: epochsError } = useEpochs(props);
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
            {isLoading ? (
                <ContainerSkeleton />
            ) : epochsError ? (
                <DisplayContainerError
                    title={`Something went wrong while fetching data for application ${props.application}`}
                    subtitle={"Check your node connection and try again."}
                />
            ) : props.application ? (
                <EpochsPage epochs={epochs} pagination={data?.pagination} />
            ) : (
                <DisplayContainerError
                    title={"An unexpected error occurred."}
                    subtitle="Check your node connection."
                />
            )}
        </ContainerStack>
    );
};
