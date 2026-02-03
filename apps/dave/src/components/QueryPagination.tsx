import type { Pagination as QPagination } from "@cartesi/viem";
import { Group, Pagination, type GroupProps } from "@mantine/core";
import type { FC } from "react";

const getActivePage = (offset: number, limit: number) => {
    const safeLimit = limit === 0 ? 1 : limit;
    return offset / safeLimit + 1;
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
    const totalPages = Math.ceil(pagination.totalCount / pagination.limit);
    const activePage = getActivePage(pagination.offset, pagination.limit);
    const displayPagination = totalPages > 1 && hideIfSinglePage;

    if (!displayPagination) return "";

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
