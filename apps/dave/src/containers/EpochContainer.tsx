"use client";
import { useEpoch, useInputs } from "@cartesi/wagmi";
import { notFound } from "next/navigation";
import { type FC } from "react";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { EpochPage } from "../page/EpochPage";
import { pathBuilder } from "../routes/routePathBuilder";
import { ContainerSkeleton } from "./ContainerSkeleton";
import ContainerStack from "./ContainerStack";

export type EpochContainerProps = {
    application: string;
    epochIndex: bigint;
    descending?: boolean;
    limit?: number;
    offset?: number;
};

export const EpochContainer: FC<EpochContainerProps> = (props) => {
    const { data: epoch, isLoading: isEpochLoading } = useEpoch(props);
    const { data: inputs, isLoading: isInputsLoading } = useInputs(props);

    const isLoading = isEpochLoading || isInputsLoading;

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
        {
            title: `Epoch #${props.epochIndex}`,
            href: pathBuilder.epoch(props),
        },
    ];

    if (!isLoading && !epoch) {
        return notFound();
    }

    return (
        <ContainerStack>
            <Hierarchy hierarchyConfig={hierarchyConfig} />
            {isLoading && <ContainerSkeleton />}
            {!!epoch && (
                <EpochPage
                    epoch={epoch}
                    inputs={inputs?.data ?? []}
                    pagination={inputs?.pagination}
                />
            )}
        </ContainerStack>
    );
};
