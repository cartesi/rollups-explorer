"use client";

import { ActionIcon, Box, Group, Tooltip } from "@mantine/core";
import { FC } from "react";
import { ApplicationItemFragment } from "../../graphql/explorer/operations";
import ResponsiveTable from "../responsiveTable";
import { Address as AddressType } from "abitype/dist/types/abi";
import Address from "../address";
import {
    TbInbox,
    TbPlugConnected,
    TbPlugConnectedX,
    TbStack2,
} from "react-icons/tb";
import { useConnectionConfig } from "../../providers/connectionConfig/hooks";
import Link from "next/link";

export interface ApplicationsTableProps {
    applications: ApplicationItemFragment[];
    fetching: boolean;
    totalCount: number;
}

interface ColumnProps {
    application: ApplicationItemFragment;
}

const ConnectionUrlColumn: FC<ColumnProps> = ({ application }) => {
    const { getConnection } = useConnectionConfig();
    const connection = getConnection(application.id as AddressType);
    return (
        <Box
            display="flex"
            w="max-content"
            style={{
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {connection?.url ?? "N/A"}
        </Box>
    );
};

const ApplicationDataColumn: FC<ColumnProps> = ({ application }) => {
    const { hasConnection, removeConnection, showConnectionModal } =
        useConnectionConfig();
    const appId = application.id as AddressType;

    return (
        <Box
            display="flex"
            w="max-content"
            style={{
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Group gap="xs">
                <Tooltip label="Summary">
                    <Link
                        href={`/applications/${appId}`}
                        data-testid="applications-summary-link"
                    >
                        <ActionIcon variant="default">
                            <TbStack2 />
                        </ActionIcon>
                    </Link>
                </Tooltip>
                <Tooltip label="Inputs">
                    <Link
                        href={`/applications/${appId}/inputs`}
                        data-testid="applications-link"
                    >
                        <ActionIcon variant="default">
                            <TbInbox />
                        </ActionIcon>
                    </Link>
                </Tooltip>
                {hasConnection(appId) ? (
                    <Tooltip label="Remove connection">
                        <ActionIcon
                            data-testid="remove-connection"
                            variant="default"
                            onClick={() => removeConnection(appId)}
                        >
                            <TbPlugConnectedX />
                        </ActionIcon>
                    </Tooltip>
                ) : (
                    <Tooltip label="Add a connection">
                        <ActionIcon
                            data-testid="add-connection"
                            variant="default"
                            onClick={() => showConnectionModal(appId)}
                        >
                            <TbPlugConnected />
                        </ActionIcon>
                    </Tooltip>
                )}
            </Group>
        </Box>
    );
};

const ApplicationsTable: FC<ApplicationsTableProps> = ({
    applications,
    fetching,
    totalCount,
}) => {
    return (
        <ResponsiveTable<ApplicationItemFragment>
            items={applications}
            fetching={fetching}
            totalCount={totalCount}
            columns={[
                {
                    key: "id",
                    label: "Id",
                    render: (application) => {
                        const appId = application.id as AddressType;
                        return (
                            <Box
                                display="flex"
                                w="max-content"
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Address value={appId} icon shorten />
                            </Box>
                        );
                    },
                },
                {
                    key: "owner",
                    label: "Owner",
                    render: (application) => (
                        <Box
                            display="flex"
                            w="max-content"
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {application.owner ? (
                                <Address
                                    value={application.owner as AddressType}
                                    icon
                                    shorten
                                />
                            ) : (
                                "N/A"
                            )}
                        </Box>
                    ),
                },
                {
                    key: "url",
                    label: "URL",
                    render: (application) => (
                        <ConnectionUrlColumn application={application} />
                    ),
                },
                {
                    key: "data",
                    label: "Data",
                    sticky: true,
                    render: (application) => (
                        <ApplicationDataColumn application={application} />
                    ),
                },
            ]}
        />
    );
};

export default ApplicationsTable;
