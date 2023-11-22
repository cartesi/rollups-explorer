import React, { FC } from "react";
import { ActionIcon, Table, Tooltip } from "@mantine/core";
import Address from "./address";
import Link from "next/link";
import { TbInbox, TbPlugConnected, TbPlugConnectedX } from "react-icons/tb";
import { Application } from "../graphql";
import { useConnectionConfig } from "../providers/connectionConfig/hooks";

interface ApplicationRowProps {
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
    const appId = application.id as Address;
    const connection = getConnection(appId);

    return (
        <Table.Tr key={application.id}>
            <Table.Td>
                <Address value={appId} icon shorten />
            </Table.Td>
            <Table.Td>
                {application.owner ? (
                    <Address
                        value={application.owner as Address}
                        icon
                        shorten
                    />
                ) : (
                    "N/A"
                )}
            </Table.Td>
            <Table.Td>{connection?.url ?? "N/A"}</Table.Td>
            <Table.Td>
                <Tooltip label="Inputs">
                    <Link href={`/applications/${appId}`}>
                        <ActionIcon variant="default">
                            <TbInbox />
                        </ActionIcon>
                    </Link>
                </Tooltip>
                {hasConnection(appId) ? (
                    <Tooltip label="Remove connection">
                        <ActionIcon
                            variant="default"
                            ml={4}
                            onClick={() => removeConnection(appId)}
                        >
                            <TbPlugConnectedX />
                        </ActionIcon>
                    </Tooltip>
                ) : (
                    <Tooltip label="Add a connection">
                        <ActionIcon
                            variant="default"
                            ml={4}
                            onClick={() => showConnectionModal(appId)}
                        >
                            <TbPlugConnected />
                        </ActionIcon>
                    </Tooltip>
                )}
            </Table.Td>
        </Table.Tr>
    );
};

export default ApplicationRow;
