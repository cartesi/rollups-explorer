"use client";
import type { Pagination } from "@cartesi/viem";
import { useApplication, useWithdrawals } from "@cartesi/wagmi";
import { useRouter, useSearchParams } from "next/navigation";
import { isNil, isNotNil } from "ramda";
import { useEffect, useMemo, useRef, type FC } from "react";
import { isForeclosed } from "../components/application/utils";
import {
    Hierarchy,
    type HierarchyConfig,
} from "../components/navigation/Hierarchy";
import {
    buildWithdrawalSearchAccountIndex,
    buildWithdrawalSearchLimit,
    buildWithdrawalSearchOffset,
    buildWithdrawalSearchSort,
    withdrawalSearchUrlQueryName,
} from "../components/withdrawal/lib/withdrawalSearchUtils";
import { WithdrawalsPage } from "../page/WithdrawalsPage";
import { pathBuilder } from "../routes/routePathBuilder";
import { ContainerSkeleton } from "./ContainerSkeleton";
import ContainerStack from "./ContainerStack";
import DisplayContainerError from "./DisplayContainerError";

export type WithdrawalsContainerProps = {
    application: string;
};

export const WithdrawalsContainer: FC<WithdrawalsContainerProps> = (props) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryParams = useMemo(() => {
        const { accountIndex, sortValue, limitValue, offsetValue } =
            withdrawalSearchUrlQueryName;

        return {
            accountIndex: buildWithdrawalSearchAccountIndex(
                searchParams.get(accountIndex),
            ),
            sort: buildWithdrawalSearchSort(searchParams.get(sortValue)),
            limit: buildWithdrawalSearchLimit(searchParams.get(limitValue)),
            offset: buildWithdrawalSearchOffset(searchParams.get(offsetValue)),
        };
    }, [searchParams]);

    const {
        data: application,
        isLoading: loadingApplication,
        error: applicationError,
    } = useApplication({ application: props.application });

    const applicationIsForeclosed =
        isNotNil(application) && isForeclosed(application);

    const {
        data: withdrawals,
        isLoading: loadingWithdrawals,
        error: withdrawalError,
    } = useWithdrawals({
        application: props.application,
        accountIndex: queryParams.accountIndex,
        limit: queryParams.limit,
        offset: queryParams.offset,
        descending: queryParams.sort.value === "desc",
        enabled: applicationIsForeclosed,
    });

    useEffect(() => {
        if (isNotNil(application) && !applicationIsForeclosed) {
            router.replace(
                pathBuilder.application({ application: props.application }),
            );
        }
    }, [application, applicationIsForeclosed, props.application, router]);

    const hasError = !isNil(applicationError) || !isNil(withdrawalError);

    const hierarchyConfig: HierarchyConfig[] = [
        { title: "Home", href: pathBuilder.home() },
        {
            title: props.application,
            href: pathBuilder.application(props),
        },
        {
            title: "Withdrawals",
            href: pathBuilder.withdrawals(props),
        },
    ];

    const fallbackPagination = useRef<Pagination>({
        limit: queryParams.limit,
        offset: queryParams.offset,
        totalCount: 0,
    });

    useEffect(() => {
        if (isNotNil(withdrawals?.pagination)) {
            fallbackPagination.current = withdrawals.pagination;
        }
    }, [withdrawals?.pagination]);

    if (isNotNil(application) && !applicationIsForeclosed) return null;

    return (
        <ContainerStack>
            <Hierarchy hierarchyConfig={hierarchyConfig} />

            {isNil(application) && loadingApplication ? (
                <ContainerSkeleton />
            ) : isNotNil(application) && !hasError ? (
                <WithdrawalsPage
                    pagination={
                        withdrawals?.pagination ?? fallbackPagination.current
                    }
                    withdrawals={{
                        data: withdrawals?.data ?? [],
                        isLoading: loadingWithdrawals,
                    }}
                    accountIndex={queryParams.accountIndex}
                    limit={queryParams.limit}
                    sort={queryParams.sort}
                />
            ) : isNotNil(applicationError) ? (
                <DisplayContainerError
                    title={`Something went wrong while fetching data for application ${props.application}`}
                    subtitle="Check your node connection and try again."
                />
            ) : isNotNil(withdrawalError) ? (
                <DisplayContainerError
                    title={`Something went wrong while fetching withdrawals for application ${props.application}`}
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
