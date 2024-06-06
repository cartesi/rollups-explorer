import { Button, Loader, Table, Text } from "@mantine/core";
import { FC, useCallback, useState } from "react";
import { Application } from "../../graphql/explorer/types";
import TableResponsiveWrapper from "../tableResponsiveWrapper";
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
    const [timeType, setTimeType] = useState<"timestamp" | "age">("age");

    const onChangeTimeColumnType = useCallback(() => {
        setTimeType((timeType) => (timeType === "age" ? "timestamp" : "age"));
    }, []);

    return (
        <TableResponsiveWrapper>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Id</Table.Th>
                        <Table.Th>URL</Table.Th>
                        <Table.Th>
                            <Button
                                variant="transparent"
                                px={0}
                                onClick={onChangeTimeColumnType}
                            >
                                {timeType === "age" ? "Age" : "Timestamp (UTC)"}
                            </Button>
                        </Table.Th>
                        <Table.Th>Data</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {fetching ? (
                        <Table.Tr>
                            <Table.Td align="center" colSpan={4}>
                                <Loader />
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        totalCount === 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={4} align="center">
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
                            timeType={timeType}
                        />
                    ))}
                </Table.Tbody>
            </Table>
        </TableResponsiveWrapper>
    );
};

export default UserApplicationsTable;
