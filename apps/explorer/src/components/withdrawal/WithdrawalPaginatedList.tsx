import type { Pagination, Withdrawal } from "@cartesi/viem";
import { Stack } from "@mantine/core";
import { type FC } from "react";
import { v4 } from "uuid";
import { QueryPagination } from "../QueryPagination";
import { WithdrawalList } from "./WithdrawalList";

type WithdrawalPaginatedListProps = {
    withdrawals: Withdrawal[];
    pagination: Pagination;
    onPaginationChange?: (newOffset: number) => void;
};

export const WithdrawalPaginatedList: FC<WithdrawalPaginatedListProps> = ({
    withdrawals,
    pagination,
    onPaginationChange,
}) => {
    return (
        <Stack id={`withdrawal-list-${v4()}`} gap={0}>
            <QueryPagination
                pagination={pagination}
                onPaginationChange={onPaginationChange}
            />
            <WithdrawalList withdrawals={withdrawals} />
        </Stack>
    );
};
