import { ActionIcon, Box, Group, Table, Tooltip } from "@mantine/core";
import Link from "next/link";
import { FC } from "react";
import {
    TbInbox,
    TbPlugConnected,
    TbPlugConnectedX,
    TbStack2,
} from "react-icons/tb";
import { Address as AddressType } from "viem";
import { Application } from "../../graphql/explorer/types";
import { useConnectionConfig } from "../../providers/connectionConfig/hooks";
import Address from "../address";
import { TBodyModifier } from "../tableResponsiveWrapper";

export interface ApplicationRowProps {
    application: Omit<Application, "inputs">;
}

const ApplicationRow: FC<ApplicationRowProps> = (props) => {
    const { application } = props;
    const {
        getConnection,
        hasConnection,
        showConnectionModal,
        removeConnection,
    } = useConnectionConfig();
    const appId = application.id as AddressType;
    const connection = getConnection(appId);

    return (
        <Table.Tr key={application.id}>
            <TBodyModifier>
                <Table.Td>
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
                </Table.Td>
                <Table.Td>
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
                </Table.Td>
                <Table.Td>
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
                </Table.Td>
                <Table.Td>
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
                                        onClick={() =>
                                            showConnectionModal(appId)
                                        }
                                    >
                                        <TbPlugConnected />
                                    </ActionIcon>
                                </Tooltip>
                            )}
                        </Group>
                    </Box>
                </Table.Td>
            </TBodyModifier>
        </Table.Tr>
    );
};

export default ApplicationRow;
