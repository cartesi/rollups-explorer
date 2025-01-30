"use client";

import {
    Group,
    Pagination,
    Select,
    Stack,
    StackProps,
    Text,
    useMantineTheme,
    VisuallyHidden,
} from "@mantine/core";
import { useMediaQuery, useScrollIntoView } from "@mantine/hooks";
import { pathOr } from "ramda";
import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { limitBounds, useUrlSearchParams } from "../hooks/useUrlSearchParams";

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
    const [{ limit, page, query }, updateParams] = useUrlSearchParams();
    const totalPages = Math.ceil(
        totalCount === undefined || totalCount === 0 ? 1 : totalCount / limit,
    );
    const theme = useMantineTheme();
    const isSmallDevice = useMediaQuery(`(max-width:${theme.breakpoints.xs})`);

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
            updateParams(pageN, limit, query);
        },
        [limit, query, updateParams],
    );

    const onChangeBottomPagination = useCallback(
        (pageN: number) => {
            updateParams(pageN, limit, query);
            scrollIntoView({ alignment: "center" });
        },
        [limit, query, scrollIntoView, updateParams],
    );

    const onChangeLimit = useCallback(
        (val: string | null) => {
            const entry = val ?? limit;
            const nextLimit = pathOr(limit, [entry], limitBounds);
            updateParams(page, nextLimit, query);
        },
        [limit, page, query, updateParams],
    );

    useEffect(() => {
        if (!fetching && page > totalPages) {
            updateParams(totalPages, limit, query);
        }
    }, [limit, page, fetching, totalPages, updateParams, query]);

    useEffect(() => {
        setActivePage((activePage: number) =>
            activePage !== page ? page : activePage,
        );
    }, [page]);

    useEffect(() => {
        onChange(limit, page);
    }, [limit, page, onChange]);

    return (
        <Stack {...restProps}>
            <Pagination
                styles={{
                    root: { alignSelf: "flex-end" },
                }}
                value={activePage}
                total={totalPages}
                siblings={isSmallDevice ? 0 : 1}
                onChange={onChangeTopPagination}
                getControlProps={(control) => ({
                    "aria-label": control,
                })}
            />

            {children}

            <Group justify="space-between" align="center">
                <Group>
                    <Text>Show:</Text>
                    <Select
                        label={
                            <VisuallyHidden>
                                Change number of items per page
                            </VisuallyHidden>
                        }
                        style={{ width: "5rem", display: "flex" }}
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
                    siblings={isSmallDevice ? 0 : 1}
                    onChange={onChangeBottomPagination}
                    getControlProps={(control) => ({
                        "aria-label": control,
                    })}
                />
            </Group>
        </Stack>
    );
};

export default Paginated;
