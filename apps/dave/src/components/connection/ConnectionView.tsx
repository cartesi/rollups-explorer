import { Badge, Button, Card, Group, Stack, Switch, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { pathOr } from "ramda";
import { Activity, type FC } from "react";
import { isDevnet } from "../../lib/supportedChains";
import CopyButton from "../CopyButton";
import { PrettyTime } from "../PrettyTime";
import { useNodeConnection } from "./hooks";
import type { DbNodeConnectionConfig } from "./types";

interface ConnectionViewProps {
    connection: DbNodeConnectionConfig;
    hideIfSelected?: boolean;
    onConnect?: () => void;
}

const colors = {
    success: "green",
    warn: "yellow",
    info: "blue",
    error: "red",
} as const;

type NotificationType = "success" | "error" | "info" | "warn";
type NotifyOpts = {
    autoClose: Parameters<typeof notifications.show>[0]["autoClose"];
};

const notify = (
    type: NotificationType,
    message: string,
    title?: string,
    opts?: NotifyOpts,
) => notifications.show({ message, title, color: colors[type], ...opts });

const ConnectionView: FC<ConnectionViewProps> = ({
    connection,
    onConnect,
    hideIfSelected = false,
}) => {
    const {
        removeConnection,
        setSelectedConnection,
        getSelectedConnection,
        updateIsPreferred,
        countConnectionSameChainDiffRpc,
    } = useNodeConnection();
    const selectedConnection = getSelectedConnection();
    const isConnected = selectedConnection?.id === connection.id;
    const isSystem = ["system", "system_mock"].includes(connection.type);
    const hideFooter = isSystem && isConnected;

    if (isConnected && hideIfSelected) return "";

    return (
        <Card shadow="sm" id={`connection-view-${connection.id}`}>
            <Card.Section withBorder inheritPadding py="sm">
                <Group justify="space-between" align="flex-start">
                    <Text fw="bold">{connection?.name}</Text>
                    {isConnected && <Badge color="green">connected</Badge>}
                </Group>
            </Card.Section>

            <Stack gap={3} py="sm">
                <Group justify="flex-start" gap={3}>
                    <Text tt="uppercase">url:</Text>
                    <Text fw="bold">{connection.url}</Text>
                    <CopyButton value={connection.url ?? ""} />
                </Group>
                <Group justify="flex-start" gap={3}>
                    <Text tt="uppercase">node version:</Text>
                    <Text fw="bold">{connection.version}</Text>
                </Group>

                <Group justify="flex-start" gap={3}>
                    <Text tt="uppercase">created:</Text>
                    <PrettyTime
                        milliseconds={connection.timestamp ?? 0}
                        size="lg"
                    />
                </Group>

                <Stack gap="3">
                    <Group justify="flex-start" gap={3}>
                        <Text tt="uppercase">Chain:</Text>
                        <Text>{connection.chain.id}</Text>
                    </Group>
                    <Text c="dimmed" size="sm">
                        {connection.chain.rpcUrl}
                    </Text>
                </Stack>
            </Stack>

            <Activity mode={hideFooter ? "hidden" : "visible"}>
                <Card.Section inheritPadding withBorder py="sm">
                    <Group justify={isSystem ? "flex-end" : "space-between"}>
                        <Activity mode={isSystem ? "hidden" : "visible"}>
                            <Switch
                                label="Preferred"
                                labelPosition="left"
                                checked={connection.isPreferred}
                                onChange={(evt) => {
                                    updateIsPreferred(
                                        {
                                            newValue: evt.currentTarget.checked,
                                            connection,
                                        },
                                        {
                                            onSuccess: () =>
                                                notify(
                                                    "success",
                                                    `Connection ${connection.name} is set as preferred.`,
                                                ),
                                            onFailure: (reason) =>
                                                notify(
                                                    "error",
                                                    pathOr(
                                                        "Could not update the connection",
                                                        ["message"],
                                                        reason,
                                                    ),
                                                ),
                                        },
                                    );
                                }}
                            />
                        </Activity>

                        <Activity mode={isConnected ? "hidden" : "visible"}>
                            <Group>
                                {connection.isDeletable && (
                                    <Button
                                        color="red"
                                        variant="subtle"
                                        onClick={() => {
                                            removeConnection(
                                                connection.id as number,
                                                {
                                                    onSuccess: () =>
                                                        notify(
                                                            "success",
                                                            `Connection ${connection.name} removed!`,
                                                        ),
                                                    onFailure: (
                                                        reason: unknown,
                                                    ) =>
                                                        notify(
                                                            "error",
                                                            pathOr(
                                                                "Could not delete the connection",
                                                                ["message"],
                                                                reason,
                                                            ),
                                                        ),
                                                },
                                            );
                                        }}
                                    >
                                        <Text tt="uppercase">remove</Text>
                                    </Button>
                                )}

                                <Button
                                    onClick={() => {
                                        onConnect?.();
                                        const isDevnetConnection = isDevnet(
                                            connection.chain.id,
                                        );

                                        if (
                                            connection.type !== "system_mock" &&
                                            isDevnetConnection
                                        ) {
                                            const countConns =
                                                countConnectionSameChainDiffRpc(
                                                    connection.chain.id,
                                                    connection.chain.rpcUrl,
                                                );

                                            const multipleRpcsForSameChainId =
                                                countConns >= 1;

                                            notify(
                                                "info",
                                                `If your wallet provider e.g Metamask has a network configuration for ${connection.chain.id},
                                                make sure the rpc-url set matches. Also, you could edit manually or just delete and reconnect your wallet`,
                                                "Good to know",
                                                { autoClose: 8000 },
                                            );

                                            if (multipleRpcsForSameChainId) {
                                                notify(
                                                    "warn",
                                                    `It looks like you have ${countConns + 1} saved connections for the same chain id with different rpc-urls. Check the wallet once connected`,
                                                    "Avoid transactions going somewhere else",
                                                    { autoClose: false },
                                                );
                                            }
                                        }

                                        setSelectedConnection(connection.id);
                                    }}
                                >
                                    <Text tt="uppercase">connect</Text>
                                </Button>
                            </Group>
                        </Activity>
                    </Group>
                </Card.Section>
            </Activity>
        </Card>
    );
};

export default ConnectionView;
