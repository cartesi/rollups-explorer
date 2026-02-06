import type { Pagination as QPagination } from "@cartesi/viem";
import { Group, Pagination, type GroupProps } from "@mantine/core";
import { isNil } from "ramda";
import type { FC } from "react";

const getActivePage = (offset: number, limit: number) => {
    const safeLimit = limit === 0 ? 1 : limit;
    return offset / safeLimit + 1;
};

const getTotalPages = (totalCount: number, limit: number) => {
    const denominator = limit === 0 || isNil(limit) ? 1 : limit;
    return Math.ceil(totalCount / denominator);
};

type QueryPaginationProps = {
    pagination: QPagination;
    onPaginationChange?: (newOffset: number) => void;
    groupProps?: GroupProps;
    hideIfSinglePage?: boolean;
};

export const QueryPagination: FC<QueryPaginationProps> = ({
    onPaginationChange,
    pagination,
    groupProps,
    hideIfSinglePage = true,
}) => {
    const totalPages = getTotalPages(pagination.totalCount, pagination.limit);
    const activePage = getActivePage(pagination.offset, pagination.limit);
    const hasNoPages = totalPages === 0;
    const isSinglePage = totalPages === 1;

    if (hasNoPages || (isSinglePage && hideIfSinglePage)) return "";

    return (
        <Group justify="flex-end" {...groupProps}>
            <Pagination
                total={totalPages}
                value={activePage}
                onChange={(newPageNumber) => {
                    if (newPageNumber !== activePage) {
                        onPaginationChange?.(
                            newPageNumber * pagination.limit - pagination.limit,
                        );
                    }
                }}
            />
        </Group>
    );
};
