import {
    ActionIcon,
    Box,
    Group,
    Paper,
    Table,
    Text,
    Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
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
import { Application } from "@cartesi/rollups-explorer-domain/explorer-types";
import { useConnectionConfig } from "../../providers/connectionConfig/hooks";
import Address from "../address";
import { DeleteConnectionModal } from "../connection/deleteConnectionModal";

export interface UserApplicationsRowProps {
    application: Omit<Application, "inputs">;
    timeType: "timestamp" | "age";
    keepDataColVisible: boolean;
}

const UserApplicationsRow: FC<UserApplicationsRowProps> = (props) => {
    const { application, keepDataColVisible, timeType } = props;
    const {
        getConnection,
        hasConnection,
        showConnectionModal,
        removeConnection,
    } = useConnectionConfig();
    const appId = application.address as AddressType;
    const version = application.rollupVersion;
    const connection = getConnection(appId);
    const [opened, { open, close }] = useDisclosure(false);

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

            <Table.Tr key={application.id}>
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

                <Table.Td
                    pos={keepDataColVisible ? "initial" : "sticky"}
                    top={0}
                    right={0}
                    p={0}
                >
                    <Paper
                        shadow={keepDataColVisible ? undefined : "xl"}
                        radius={0}
                        p="var(--table-vertical-spacing) var(--table-horizontal-spacing, var(--mantine-spacing-xs))"
                    >
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
                                            ml={4}
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
                    </Paper>
                </Table.Td>
            </Table.Tr>
        </>
    );
};

export default UserApplicationsRow;
