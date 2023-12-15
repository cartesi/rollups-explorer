"use client";

import { Loader, Table } from "@mantine/core";
import { FC } from "react";
import ApplicationRow from "./applicationRow";
import type { ApplicationItemFragment } from "../../graphql";
import { Application } from "../../graphql";

export interface ApplicationsTableProps {
    applications: ApplicationItemFragment[];
    fetching: boolean;
    totalCount: number;
}

const ApplicationsTable: FC<ApplicationsTableProps> = (props) => {
    const { applications, fetching, totalCount } = props;

    return (
        <Table>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th>Id</Table.Th>
                    <Table.Th>Owner</Table.Th>
                    <Table.Th>URL</Table.Th>
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
                                No applications
                            </Table.Td>
                        </Table.Tr>
                    )
                )}
                {applications.map((application) => (
                    <ApplicationRow
                        key={application.id}
                        application={application as Omit<Application, "inputs">}
                    />
                ))}
            </Table.Tbody>
        </Table>
    );
};

export default ApplicationsTable;
