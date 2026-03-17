"use client";
import {
    useEpochs,
    useInputs,
    useOutputs,
    useReports,
    useTournaments,
} from "@cartesi/wagmi";
import type { FC } from "react";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { ApplicationSummaryPage } from "../page/ApplicationSummaryPage";
import { pathBuilder } from "../routes/routePathBuilder";
import ContainerStack from "./ContainerStack";

interface ApplicationSummaryContainerProps {
    application: string;
}

const defaultParams = {
    limit: 2,
    descending: true,
};

export const ApplicationSummaryContainer: FC<
    ApplicationSummaryContainerProps
> = (props) => {
    const epochsResult = useEpochs({
        application: props.application,
        ...defaultParams,
    });
    const reportsResult = useReports({
        application: props.application,
        ...defaultParams,
    });
    const outputsResult = useOutputs({
        application: props.application,
        ...defaultParams,
    });

    const inputsResult = useInputs({
        application: props.application,
        ...defaultParams,
    });

    const tournamentsResult = useTournaments({
        application: props.application,
        level: 0n,
        ...defaultParams,
    });

    const epochs = {
        data: epochsResult.data?.data ?? [],
        totalCount: epochsResult.data?.pagination.totalCount ?? 0,
        isLoading: epochsResult.isLoading,
    };

    const reports = {
        totalCount: reportsResult.data?.pagination.totalCount ?? 0,
        isLoading: reportsResult.isLoading,
    };

    const outputs = {
        totalCount: outputsResult.data?.pagination.totalCount ?? 0,
        isLoading: outputsResult.isLoading,
    };

    const inputs = {
        data: inputsResult.data?.data ?? [],
        totalCount: inputsResult.data?.pagination.totalCount ?? 0,
        isLoading: inputsResult.isLoading,
    };
    const tournaments = {
        data: tournamentsResult.data?.data ?? [],
        totalCount: tournamentsResult.data?.pagination.totalCount ?? 0,
        isLoading: tournamentsResult.isLoading,
    };

    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: "/" },
        {
            title: props.application,
            href: pathBuilder.application({ application: props.application }),
        },
    ];

    return (
        <ContainerStack>
            <Hierarchy hierarchyConfig={hierarchyConfig} />
            <ApplicationSummaryPage
                application={props.application}
                epochs={epochs}
                inputs={inputs}
                outputs={outputs}
                reports={reports}
                tournaments={tournaments}
            />
        </ContainerStack>
    );
};
