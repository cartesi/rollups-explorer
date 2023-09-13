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
} from "@mantine/core";
import Link from "next/link";
import { FC } from "react";
import { ApplicationOrderByInput, useApplicationsQuery } from "../../graphql";
import { TbApps, TbInbox, TbInputSearch } from "react-icons/tb";
import Address from "../../components/address";

export type ApplicationsPageProps = {};

const ApplicationsPage: FC<ApplicationsPageProps> = (props) => {
    const [query] = useApplicationsQuery({
        variables: { orderBy: ApplicationOrderByInput.IdAsc },
    });
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
                    {query.data?.applicationsConnection.totalCount === 0 && (
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
                                    <Address value={node.id as Address} icon />
                                </Table.Td>
                                <Table.Td>
                                    <Address
                                        value={node.owner as Address}
                                        icon
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <Tooltip label="Inputs">
                                        <Link href={`/applications/${node.id}`}>
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
                <Table.Tfoot></Table.Tfoot>
            </Table>
        </Stack>
    );
};

export default ApplicationsPage;
