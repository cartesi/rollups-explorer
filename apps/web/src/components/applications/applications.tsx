"use client";

import { Group, Pagination, Select, Stack, Text } from "@mantine/core";
import { useScrollIntoView } from "@mantine/hooks";
import { pathOr } from "ramda";
import { FC, useEffect, useState } from "react";
import {
    ApplicationOrderByInput,
    useApplicationsConnectionQuery,
} from "../../graphql";
import {
    limitBounds,
    usePaginationParams,
} from "../../hooks/usePaginationParams";
import ApplicationsTable from "./applicationsTable";

const Applications: FC = () => {
    const [{ limit, page }, updateParams] = usePaginationParams();
    const after = page === 1 ? undefined : ((page - 1) * limit).toString();
    const [query] = useApplicationsConnectionQuery({
        variables: { orderBy: ApplicationOrderByInput.IdAsc, limit, after },
    });
    const totalInputs = query.data?.applicationsConnection.totalCount ?? 1;
    const totalPages = Math.ceil(totalInputs / limit);
    const [activePage, setActivePage] = useState(
        page > totalPages ? totalPages : page,
    );
    const applications =
        query.data?.applicationsConnection.edges.map((edge) => edge.node) ?? [];
    const { scrollIntoView } = useScrollIntoView<HTMLDivElement>({
        duration: 700,
        offset: 150,
        cancelable: true,
    });

    useEffect(() => {
        if (!query.fetching && page > totalPages) {
            updateParams(totalPages, limit);
        }
    }, [limit, page, query.fetching, totalPages, updateParams]);

    useEffect(() => {
        setActivePage((n) => {
            return n !== page ? page : n;
        });
    }, [page]);

    return (
        <Stack>
            <Pagination
                styles={{ root: { alignSelf: "flex-end" } }}
                value={activePage}
                total={totalPages}
                onChange={(pageN) => {
                    updateParams(pageN, limit);
                }}
            />

            <ApplicationsTable
                applications={applications}
                fetching={query.fetching}
                totalCount={query.data?.applicationsConnection.totalCount ?? 0}
            />

            <Group justify="space-between" align="center">
                <Group>
                    <Text>Show:</Text>
                    <Select
                        style={{ width: "5rem" }}
                        value={limit.toString()}
                        onChange={(val) => {
                            const entry = val ?? limit;
                            const l = pathOr(limit, [entry], limitBounds);
                            updateParams(page, l);
                        }}
                        data={[
                            limitBounds[10].toString(),
                            limitBounds[20].toString(),
                            limitBounds[30].toString(),
                        ]}
                    />
                    <Text>Applications</Text>
                </Group>
                <Pagination
                    styles={{ root: { alignSelf: "flex-end" } }}
                    value={activePage}
                    total={totalPages}
                    onChange={(pageN) => {
                        updateParams(pageN, limit);
                        scrollIntoView({ alignment: "center" });
                    }}
                />
            </Group>
        </Stack>
    );
};

export default Applications;
