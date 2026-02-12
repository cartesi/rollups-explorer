import { Badge, Button, Card, Group, Stack, Switch, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { pathOr } from "ramda";
import { Activity, type FC } from "react";
import CopyButton from "../CopyButton";
import { PrettyTime } from "../PrettyTime";
import { useNodeConnection, useSelectedNodeConnection } from "./hooks";
import type { NodeConnectionConfig } from "./types";

interface ConnectionViewProps {
    connection: NodeConnectionConfig;
}

const colors = {
    success: "green",
    warn: "yellow",
    info: "blue",
    error: "red",
} as const;

type NotificationType = "success" | "error" | "info" | "warn";

const notify = (type: NotificationType, message: string, title?: string) =>
    notifications.show({ message, title, color: colors[type] });

const ConnectionView: FC<ConnectionViewProps> = ({ connection }) => {
    const selectedConnection = useSelectedNodeConnection();
    const { removeConnection, setSelectedConnection } = useNodeConnection();
    const isConnected = selectedConnection?.id === connection.id;
    const isSystem = ["system", "system_mock"].includes(connection.type);

    return (
        <Card shadow="sm" id={`connection-view-${connection.id}`}>
            <Card.Section withBorder inheritPadding py="sm">
                <Group justify="space-between" align="flex-start">
                    <Text fw="bold">{connection?.name}</Text>
                    <Badge>{connection?.type}</Badge>
                </Group>
            </Card.Section>

            <Stack gap={3} py="sm">
                <Group justify="flex-start" gap={3}>
                    <Text tt="uppercase">url:</Text>
                    <Text fw="bold">{connection?.url}</Text>
                    <CopyButton value={connection?.url ?? ""} />
                </Group>
                <Group justify="flex-start" gap={3}>
                    <Text tt="uppercase">node version:</Text>
                    <Text fw="bold">{connection?.version}</Text>
                </Group>

                <Group justify="flex-start" gap={3}>
                    <Text tt="uppercase">created:</Text>
                    <PrettyTime
                        milliseconds={connection?.timestamp ?? 0}
                        size="lg"
                    />
                </Group>
            </Stack>

            <Card.Section inheritPadding withBorder py="sm">
                <Group justify={isSystem ? "flex-end" : "space-between"}>
                    <Activity mode={isSystem ? "hidden" : "visible"}>
                        <Switch
                            label="Preferred"
                            labelPosition="left"
                            checked={connection?.isPreferred ?? false}
                        />
                    </Activity>

                    <Group>
                        {connection?.isDeletable && (
                            <Button
                                onClick={() => {
                                    removeConnection(connection.id as number, {
                                        onSuccess: () =>
                                            notify(
                                                "success",
                                                `Connection ${connection.name} removed!`,
                                            ),
                                        onFailure: (reason: unknown) =>
                                            notify(
                                                "error",
                                                pathOr(
                                                    "Could not delete the connection",
                                                    ["message"],
                                                    reason,
                                                ),
                                            ),
                                    });
                                }}
                            >
                                REMOVE
                            </Button>
                        )}

                        {isConnected ? (
                            <Badge color="green" radius={0}>
                                connected
                            </Badge>
                        ) : (
                            <Button
                                onClick={() => {
                                    setSelectedConnection(connection);
                                }}
                            >
                                <Text tt="uppercase">connect</Text>
                            </Button>
                        )}
                    </Group>
                </Group>
            </Card.Section>
        </Card>
    );
};

export default ConnectionView;
