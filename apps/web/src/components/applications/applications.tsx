"use client";

import { Loader, Stack, Table } from "@mantine/core";
import { FC, useCallback, useState } from "react";
import {
    ApplicationOrderByInput,
    useApplicationsConnectionQuery,
} from "../graphql";
import ApplicationRow from "../components/applicationRow";
import Paginated from "./paginated";

const Applications: FC = () => {
    const [limit, setLimit] = useState(10);
    const [page, setPage] = useState(1);
    const after = page === 1 ? undefined : ((page - 1) * limit).toString();
    const [query] = useApplicationsConnectionQuery({
        variables: { orderBy: ApplicationOrderByInput.IdAsc, limit, after },
    });

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
                <Table>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Id</Table.Th>
                            <Table.Th>Owner</Table.Th>
                            <Table.Th>URL</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {query.fetching && (
                            <Table.Tr>
                                <Table.Td align="center" colSpan={3}>
                                    <Loader />
                                </Table.Td>
                            </Table.Tr>
                        )}
                        {query.data?.applicationsConnection.totalCount ===
                            0 && (
                            <Table.Tr>
                                <Table.Td colSpan={3} align="center">
                                    No applications
                                </Table.Td>
                            </Table.Tr>
                        )}
                        {query.data?.applicationsConnection.edges.map(
                            ({ node }) => (
                                <ApplicationRow
                                    key={node.id}
                                    application={
                                        node as Omit<Application, "inputs">
                                    }
                                />
                            ),
                        )}
                    </Table.Tbody>
                </Table>
            </Paginated>
        </Stack>
    );
};

export default Applications;
