"use client";
import type { Pagination, Withdrawal } from "@cartesi/client";
import { Stack } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { type FC } from "react";
import { TbTransferOut } from "react-icons/tb";
import CenteredText from "../components/CenteredText";
import { QueryPagination } from "../components/QueryPagination";
import PageTitle from "../components/layout/PageTitle";
import { WithdrawalList } from "../components/withdrawal/WithdrawalList";
import { WithdrawalSearch } from "../components/withdrawal/WithdrawalSearch";
import {
    withdrawalSearchUrlQueryName,
    type WithdrawalSearchLimit,
    type WithdrawalSearchSort,
} from "../components/withdrawal/lib/withdrawalSearchUtils";
import useUpdateQueryString from "../hooks/useUpdateQueryString";

type WithdrawalsPageProps = {
    withdrawals: {
        data: Withdrawal[];
        isLoading: boolean;
    };
    pagination: Pagination;
    accountIndex?: bigint;
    sort?: WithdrawalSearchSort;
    limit?: WithdrawalSearchLimit;
};

export const WithdrawalsPage: FC<WithdrawalsPageProps> = ({
    withdrawals,
    pagination,
    accountIndex,
    sort = { value: "desc" },
    limit = 50,
}) => {
    const [updateUrlQueryString] = useUpdateQueryString();
    const updateAccountIndexQueryString = useDebouncedCallback(
        (newAccountIndex: string) => {
            updateUrlQueryString([
                {
                    name: withdrawalSearchUrlQueryName.accountIndex,
                    value: newAccountIndex,
                },
                {
                    name: withdrawalSearchUrlQueryName.offsetValue,
                    value: "0",
                },
            ]);
        },
        300,
    );

    return (
        <Stack gap="xl">
            <PageTitle Icon={TbTransferOut} title="Withdrawals" />

            <Stack>
                <WithdrawalSearch
                    accountIndex={accountIndex}
                    sort={sort}
                    limit={limit}
                    onAccountIndexChange={(newAccountIndex) => {
                        updateAccountIndexQueryString(newAccountIndex);
                    }}
                    onSortChange={(newSort) => {
                        updateUrlQueryString([
                            {
                                name: withdrawalSearchUrlQueryName.sortValue,
                                value: newSort.value,
                            },
                            {
                                name: withdrawalSearchUrlQueryName.offsetValue,
                                value: "0",
                            },
                        ]);
                    }}
                    onLimitChange={(newLimit) => {
                        updateUrlQueryString([
                            {
                                name: withdrawalSearchUrlQueryName.limitValue,
                                value: newLimit.toString(),
                            },
                            {
                                name: withdrawalSearchUrlQueryName.offsetValue,
                                value: "0",
                            },
                        ]);
                    }}
                />

                <Stack gap={0}>
                    <QueryPagination
                        pagination={pagination}
                        onPaginationChange={(newOffset) => {
                            updateUrlQueryString([
                                {
                                    name: withdrawalSearchUrlQueryName.offsetValue,
                                    value: newOffset.toString(),
                                },
                            ]);
                        }}
                    />

                    {withdrawals.isLoading ? (
                        <CenteredText
                            text="Loading withdrawals..."
                            cardProps={{ mt: "xl" }}
                            textProps={{ size: "lg" }}
                        />
                    ) : withdrawals.data.length === 0 ? (
                        <CenteredText
                            text="No withdrawals found"
                            cardProps={{ mt: "xl" }}
                            textProps={{ size: "lg" }}
                        />
                    ) : (
                        <WithdrawalList withdrawals={withdrawals.data} />
                    )}
                </Stack>
            </Stack>
        </Stack>
    );
};
