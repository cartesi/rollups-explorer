"use client";

import { Loader, Table, Text } from "@mantine/core";
import { FC } from "react";
import { ApplicationItemFragment } from "../../graphql/explorer/operations";
import { Application } from "../../graphql/explorer/types";
import TableResponsiveWrapper from "../tableResponsiveWrapper";
import ApplicationRow from "./applicationRow";

export interface ApplicationsTableProps {
    applications: ApplicationItemFragment[];
    fetching: boolean;
    totalCount: number;
}

const ApplicationsTable: FC<ApplicationsTableProps> = (props) => {
    const { applications, fetching, totalCount } = props;

    return (
        <TableResponsiveWrapper>
            <Table data-testid="applications-table">
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Id</Table.Th>
                        <Table.Th>Owner</Table.Th>
                        <Table.Th>URL</Table.Th>
                        <Table.Th>Data</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {fetching ? (
                        <Table.Tr>
                            <Table.Td align="center" colSpan={4}>
                                <Loader data-testid="applications-spinner" />
                            </Table.Td>
                        </Table.Tr>
                    ) : (
                        totalCount === 0 && (
                            <Table.Tr>
                                <Table.Td colSpan={4} align="center">
                                    <Text fw={700}>No applications</Text>
                                </Table.Td>
                            </Table.Tr>
                        )
                    )}
                    {applications.map((application) => (
                        <ApplicationRow
                            key={application.id}
                            application={
                                application as Omit<Application, "inputs">
                            }
                        />
                    ))}
                </Table.Tbody>
            </Table>
        </TableResponsiveWrapper>
    );
};

export default ApplicationsTable;
