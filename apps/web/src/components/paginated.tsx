"use client";

import {
    Group,
    Pagination,
    Select,
    Stack,
    StackProps,
    Text,
} from "@mantine/core";
import { useScrollIntoView } from "@mantine/hooks";
import { pathOr } from "ramda";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { limitBounds, usePaginationParams } from "../hooks/usePaginationParams";

export const perPageList = Array.from({ length: 3 }).map((_, index) => {
    const key = ((index + 1) * 10).toString() as keyof typeof limitBounds;
    return limitBounds[key].toString();
});

export interface PaginatedProps extends Omit<StackProps, "onChange"> {
    children: ReactNode;
    totalCount?: number;
    fetching: boolean;
    onChange: (limit: number, page: number) => void;
}

const Paginated: FC<PaginatedProps> = (props) => {
    const { children, totalCount, fetching, onChange, ...restProps } = props;
    const [{ limit, page }, updateParams] = usePaginationParams();
    const totalPages = Math.ceil(
        totalCount === undefined || totalCount === 0 ? 1 : totalCount / limit,
    );

    const [activePage, setActivePage] = useState(
        page > totalPages ? totalPages : page,
    );
    const { scrollIntoView } = useScrollIntoView<HTMLDivElement>({
        duration: 700,
        offset: 150,
        cancelable: true,
    });

    const onChangeTopPagination = useCallback(
        (pageN: number) => {
            updateParams(pageN, limit);
        },
        [limit, updateParams],
    );

    const onChangeBottomPagination = useCallback(
        (pageN: number) => {
            updateParams(pageN, limit);
            scrollIntoView({ alignment: "center" });
        },
        [limit, scrollIntoView, updateParams],
    );

    const onChangeLimit = useCallback(
        (val: string | null) => {
            const entry = val ?? limit;
            const nextLimit = pathOr(limit, [entry], limitBounds);
            updateParams(page, nextLimit);
        },
        [limit, page, updateParams],
    );

    useEffect(() => {
        if (!fetching && page > totalPages) {
            updateParams(totalPages, limit);
        }
    }, [limit, page, fetching, totalPages, updateParams]);

    useEffect(() => {
        setActivePage((activePage) =>
            activePage !== page ? page : activePage,
        );
    }, [page]);

    useEffect(() => {
        onChange(limit, page);
    }, [limit, page, onChange]);

    return (
        <Stack {...restProps}>
            <Pagination
                styles={{ root: { alignSelf: "flex-end" } }}
                value={activePage}
                total={totalPages}
                onChange={onChangeTopPagination}
            />

            {children}

            <Group justify="space-between" align="center">
                <Group>
                    <Text>Show:</Text>
                    <Select
                        style={{ width: "5rem" }}
                        value={limit.toString()}
                        onChange={onChangeLimit}
                        data={perPageList}
                    />
                    <Text>items</Text>
                </Group>
                <Pagination
                    styles={{ root: { alignSelf: "flex-end" } }}
                    value={activePage}
                    total={totalPages}
                    onChange={onChangeBottomPagination}
                />
            </Group>
        </Stack>
    );
};

export default Paginated;
