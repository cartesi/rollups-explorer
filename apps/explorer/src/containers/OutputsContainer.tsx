"use client";
import type { Pagination } from "@cartesi/viem";
import { useApplication, useOutputs } from "@cartesi/wagmi";
import { useSearchParams } from "next/navigation";
import { isNil, isNotNil } from "ramda";
import { useEffect, useMemo, useRef, type FC } from "react";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import {
    buildSearchFilter,
    buildSearchLimit,
    buildSearchOffset,
    buildSearchSort,
    outputSearchUrlQueryName,
} from "../components/output/lib/outputSearchUtils";
import { OutputsPage } from "../page/OutputsPage";
import { pathBuilder } from "../routes/routePathBuilder";
import { ContainerSkeleton } from "./ContainerSkeleton";
import ContainerStack from "./ContainerStack";
import DisplayContainerError from "./DisplayContainerError";

export type OutputsContainerProps = {
    application: string;
};

export const OutputsContainer: FC<OutputsContainerProps> = (props) => {
    const searchParams = useSearchParams();
    const queryParams = useMemo(() => {
        const { filterType, filterValue, sortValue, limitValue, offsetValue } =
            outputSearchUrlQueryName;
        const filter = buildSearchFilter({
            filterType: searchParams.get(filterType),
            filterValue: searchParams.get(filterValue),
        });
        const sort = buildSearchSort(searchParams.get(sortValue));
        const limit = buildSearchLimit(searchParams.get(limitValue));
        const offset = buildSearchOffset(searchParams.get(offsetValue));
        return { filter, sort, limit, offset };
    }, [searchParams]);

    const {
        data: outputs,
        isLoading: loadingOutputs,
        error: outputError,
    } = useOutputs({
        application: props.application,
        outputType: queryParams.filter.type?.value,
        limit: queryParams.limit,
        offset: queryParams.offset,
        descending: queryParams.sort.value === "desc",
    });

    const {
        data: application,
        isLoading: loadingApplication,
        error: applicationError,
    } = useApplication({
        application: props.application,
    });

    const hasError = !isNil(applicationError) || !isNil(outputError);

    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: "/" },
        {
            title: props.application,
            href: pathBuilder.application(props),
        },
        {
            title: "Outputs",
            href: pathBuilder.outputs(props),
        },
    ];

    const fallbackPagination = useRef<Pagination>({
        limit: queryParams.limit,
        offset: queryParams.offset,
        totalCount: 0,
    });

    useEffect(() => {
        if (isNotNil(outputs?.pagination)) {
            // keep last known pagination while in transit as the data becomes nil.
            fallbackPagination.current = outputs.pagination;
        }
    }, [outputs?.pagination]);

    return (
        <ContainerStack>
            <Hierarchy hierarchyConfig={hierarchyConfig} />

            {isNil(application) && loadingApplication ? (
                <ContainerSkeleton />
            ) : isNotNil(application) && !hasError ? (
                <OutputsPage
                    application={application}
                    pagination={
                        outputs?.pagination ?? fallbackPagination.current
                    }
                    outputs={{
                        data: outputs?.data ?? [],
                        isLoading: loadingOutputs,
                    }}
                    limit={queryParams.limit}
                    filter={queryParams.filter}
                    sort={queryParams.sort}
                />
            ) : isNotNil(applicationError) ? (
                <DisplayContainerError
                    title={`Something went wrong while fetching data for application ${props.application}`}
                    subtitle="Check your node connection and try again."
                />
            ) : isNotNil(outputError) ? (
                <DisplayContainerError
                    title={`Something went wrong while fetching the outputs for application ${props.application}`}
                    subtitle="Check your node connection and try again."
                />
            ) : (
                <DisplayContainerError
                    title="An unexpected error occurred."
                    subtitle="Check your node connection."
                />
            )}
        </ContainerStack>
    );
};
