import { ActionIcon, Box, Group, Table, Text, Tooltip } from "@mantine/core";
import Link from "next/link";
import prettyMilliseconds from "pretty-ms";
import { FC } from "react";
import {
    TbInbox,
    TbPlugConnected,
    TbPlugConnectedX,
    TbStack2,
} from "react-icons/tb";
import { Address as AddressType } from "viem";
import { useConnectionConfig } from "../../providers/connectionConfig/hooks";
import Address from "../address";
import { TBodyModifier } from "../tableResponsiveWrapper";
import { ApplicationRowProps } from "./applicationRow";

export interface UserApplicationsRowProps extends ApplicationRowProps {
    timeType: "timestamp" | "age";
}

const UserApplicationsRow: FC<UserApplicationsRowProps> = (props) => {
    const { application, timeType } = props;
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
                <Table.Td>{connection?.url ?? "N/A"}</Table.Td>
                <Table.Td>
                    <Box
                        display="flex"
                        w="max-content"
                        style={{
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Text>
                            {application && application?.timestamp && (
                                <>
                                    {timeType === "age"
                                        ? `${prettyMilliseconds(
                                              Date.now() -
                                                  application.timestamp * 1000,
                                              {
                                                  unitCount: 2,
                                                  secondsDecimalDigits: 0,
                                                  verbose: true,
                                              },
                                          )} ago`
                                        : new Date(
                                              application.timestamp * 1000,
                                          ).toISOString()}
                                </>
                            )}
                        </Text>
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
                                        ml={4}
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
                                        ml={4}
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

export default UserApplicationsRow;
