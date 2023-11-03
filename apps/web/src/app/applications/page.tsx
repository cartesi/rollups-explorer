"use client";
import {
    ActionIcon,
    Anchor,
    Breadcrumbs,
    Group,
    Loader,
    Stack,
    Table,
    Title,
    Tooltip,
    Pagination,
    Select,
    Text,
} from "@mantine/core";
import Link from "next/link";
import { FC, useEffect, useState } from "react";
import { useScrollIntoView } from "@mantine/hooks";
import { pathOr } from "ramda";
import {
    ApplicationOrderByInput,
    useApplicationsConnectionQuery,
} from "../../graphql";
import { TbApps, TbInbox } from "react-icons/tb";
import Address from "../../components/address";
import {
    limitBounds,
    usePaginationParams,
} from "../../hooks/usePaginationParams";

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
                                <Table.Tr key={node.id}>
                                    <Table.Td>
                                        <Address
                                            value={node.id as Address}
                                            icon
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        {node.owner ? (
                                            <Address
                                                value={node.owner as Address}
                                                icon
                                            />
                                        ) : (
                                            "N/A"
                                        )}
                                    </Table.Td>
                                    <Table.Td>
                                        <Tooltip label="Inputs">
                                            <Link
                                                href={`/applications/${node.id}`}
                                            >
                                                <ActionIcon variant="default">
                                                    <TbInbox />
                                                </ActionIcon>
                                            </Link>
                                        </Tooltip>
                                    </Table.Td>
                                </Table.Tr>
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
                        <Text>inputs</Text>
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
