"use client";

import { Stack } from "@mantine/core";
import { FC, useCallback, useState } from "react";
import { ApplicationOrderByInput } from "../../graphql/explorer/types";
import { useApplicationsConnectionQuery } from "../../graphql/explorer/hooks/queries";
import ApplicationsTable from "../applications/applicationsTable";
import Paginated from "../paginated";

const Applications: FC = () => {
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const after = page === 1 ? undefined : ((page - 1) * limit).toString();
    const [query] = useApplicationsConnectionQuery({
        variables: { orderBy: ApplicationOrderByInput.IdAsc, limit, after },
    });
    const applications =
        query.data?.applicationsConnection.edges.map((edge) => edge.node) ?? [];

    const onChangePagination = useCallback((limit: number, page: number) => {
        setLimit(limit);
        setPage(page);
    }, []);

    return (
        <Stack>
            <Paginated
                fetching={query.fetching}
                totalCount={query.data?.applicationsConnection.totalCount}
                onChange={onChangePagination}
            >
                <ApplicationsTable
                    applications={applications}
                    fetching={query.fetching}
                    totalCount={
                        query.data?.applicationsConnection.totalCount ?? 0
                    }
                />
            </Paginated>
        </Stack>
    );
};

export default Applications;
