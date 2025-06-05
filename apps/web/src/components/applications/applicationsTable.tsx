"use client";

import { ActionIcon, Box, Group, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { FC } from "react";
import {
    TbInbox,
    TbPlugConnected,
    TbPlugConnectedX,
    TbStack2,
} from "react-icons/tb";
import { Address as AddressType } from "viem";
import { ApplicationItemFragment } from "../../graphql/explorer/operations";
import { useConnectionConfig } from "../../providers/connectionConfig/hooks";
import Address from "../address";
import { DeleteConnectionModal } from "../connection/deleteConnectionModal";
import ResponsiveTable from "../responsiveTable";

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
    const connection = getConnection(application.address as AddressType);
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
    const [opened, { open, close }] = useDisclosure(false);
    const appId = application.address as AddressType;
    const version = application.rollupVersion;

    return (
        <>
            <DeleteConnectionModal
                isOpened={opened}
                onClose={close}
                onConfirm={() => {
                    removeConnection(appId);
                    close();
                }}
            />

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
                            href={`/applications/${appId}/${version}`}
                            data-testid="applications-summary-link"
                        >
                            <ActionIcon variant="default">
                                <TbStack2 />
                            </ActionIcon>
                        </Link>
                    </Tooltip>
                    <Tooltip label="Inputs">
                        <Link
                            href={`/applications/${appId}/${version}/inputs`}
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
                                onClick={open}
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
        </>
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
                        const address = application.address as AddressType;
                        return (
                            <Box
                                display="flex"
                                w="max-content"
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Address value={address} icon shorten />
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
