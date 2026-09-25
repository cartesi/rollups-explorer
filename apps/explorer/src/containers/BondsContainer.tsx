"use client";
import type { Pagination } from "@cartesi/client";
import { useBondEvents } from "@cartesi/react";
import { useSearchParams } from "next/navigation";
import { isNil, isNotNil } from "ramda";
import { useEffect, useMemo, useRef, type FC } from "react";
import {
    bondSearchUrlQueryName,
    buildBondSearchEpoch,
    buildBondSearchLimit,
    buildBondSearchOffset,
} from "../components/bond/lib/bondSearchUtils";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import { content } from "../content";
import { useBondEventSummary } from "../hooks/useBondEventSummary";
import { BondsPage } from "../page/BondsPage";
import { pathBuilder } from "../routes/routePathBuilder";
import ContainerStack from "./ContainerStack";
import DisplayContainerError from "./DisplayContainerError";

export type BondsContainerProps = {
    application: string;
};

export const BondsContainer: FC<BondsContainerProps> = (props) => {
    const searchParams = useSearchParams();
    const queryParams = useMemo(() => {
        const { epoch, limitValue, offsetValue } = bondSearchUrlQueryName;
        return {
            epochIndex: buildBondSearchEpoch(searchParams.get(epoch)),
            limit: buildBondSearchLimit(searchParams.get(limitValue)),
            offset: buildBondSearchOffset(searchParams.get(offsetValue)),
        };
    }, [searchParams]);

    const { data, isLoading, error } = useBondEvents({
        application: props.application,
        epochIndex: queryParams.epochIndex,
        limit: queryParams.limit,
        offset: queryParams.offset,
        descending: true,
    });

    const summary = useBondEventSummary({
        application: props.application,
        epochIndex: queryParams.epochIndex,
        totalCount: data?.pagination.totalCount,
    });

    const fallbackPagination = useRef<Pagination>({
        limit: queryParams.limit,
        offset: queryParams.offset,
        totalCount: 0,
    });

    useEffect(() => {
        if (isNotNil(data?.pagination)) {
            // keep last known pagination while in transit as the data becomes nil.
            fallbackPagination.current = data.pagination;
        }
    }, [data?.pagination]);

    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: "/" },
        {
            title: props.application,
            href: pathBuilder.application(props),
        },
        {
            title: content.bond.page.titleTxt,
            href: pathBuilder.bonds(props),
        },
    ];

    return (
        <ContainerStack>
            <Hierarchy hierarchyConfig={hierarchyConfig} />
            {isNil(error) ? (
                <BondsPage
                    application={props.application}
                    epochIndex={queryParams.epochIndex}
                    events={data?.data ?? []}
                    isLoading={isLoading}
                    isSummaryLoading={summary.isLoading}
                    limit={queryParams.limit}
                    pagination={data?.pagination ?? fallbackPagination.current}
                    summary={summary.data}
                />
            ) : (
                <DisplayContainerError
                    title={`${content.bond.page.errorTxt} ${props.application}`}
                    subtitle="Check your node connection and try again."
                />
            )}
        </ContainerStack>
    );
};
