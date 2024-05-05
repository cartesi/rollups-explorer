import { Box, Loader, Table, Text } from "@mantine/core";
import { FC } from "react";
import { Application } from "../../graphql/explorer/types";
import { ApplicationsTableProps } from "./applicationsTable";
import UserApplicationsRow from "./userApplicationsRow";

interface UserApplicationsTableProps extends ApplicationsTableProps {
    noResultsMessage?: string;
}

const UserApplicationsTable: FC<UserApplicationsTableProps> = (props) => {
    const {
        applications,
        fetching,
        totalCount,
        noResultsMessage = "No applications",
    } = props;
    return (
        <Box>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Id</Table.Th>
                        <Table.Th>URL</Table.Th>
                        <Table.Th>Age</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {fetching ? (
                        <Table.Tr>
                            <Table.Td align="center" colSpan={3}>
                                <Loader />
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        totalCount === 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={3} align="center">
                                    <Text fw={700}>{noResultsMessage}</Text>
                                </Table.Td>
                            </Table.Tr>
                        )
                    )}
                    {applications.map((application) => (
                        <UserApplicationsRow
                            key={application.id}
                            application={
                                application as Omit<Application, "inputs">
                            }
                        />
                    ))}
                </Table.Tbody>
            </Table>
        </Box>
    );
};

export default UserApplicationsTable;
