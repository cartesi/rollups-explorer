"use client";
import {
    Anchor,
    Breadcrumbs,
    Group,
    Loader,
    Pagination,
    Select,
    Stack,
    Table,
    Text,
    Title,
} from "@mantine/core";
import { useScrollIntoView } from "@mantine/hooks";
import Link from "next/link";
import { pathOr } from "ramda";
import { FC, useEffect, useState } from "react";
import { TbApps } from "react-icons/tb";
import {
    Application,
    ApplicationOrderByInput,
    useApplicationsConnectionQuery,
} from "../../graphql";
import {
    limitBounds,
    usePaginationParams,
} from "../../hooks/usePaginationParams";
import ApplicationRow from "../../components/applicationRow";

export type ApplicationsPageProps = {};

const ApplicationsPage: FC<ApplicationsPageProps> = (props) => {
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

    const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
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
            <Breadcrumbs>
                <Anchor href="/" component={Link}>
                    Home
                </Anchor>
            </Breadcrumbs>
            <Group>
                <TbApps size={40} />
                <Title order={2}>Applications</Title>
            </Group>

            <Stack>
                <Pagination
                    styles={{ root: { alignSelf: "flex-end" } }}
                    value={activePage}
                    total={totalPages}
                    onChange={(pageN) => {
                        updateParams(pageN, limit);
                    }}
                />
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
        </Stack>
    );
};

export default ApplicationsPage;
