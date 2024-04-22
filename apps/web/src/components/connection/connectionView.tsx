"use client";
import {
    Avatar,
    Button,
    Group,
    Stack,
    Text,
    Title,
    useMantineTheme,
    VisuallyHidden,
} from "@mantine/core";
import { TbPlus } from "react-icons/tb";
import { useConnectionConfig } from "../../providers/connectionConfig/hooks";
import ConnectionInfo from "./connectionInfo";

const ConnectionView = () => {
    const { listConnections, showConnectionModal } = useConnectionConfig();
    const theme = useMantineTheme();
    const connections = listConnections();
    const hasConnections = connections.length > 0;

    return (
        <>
            <Group justify="space-between">
                <Group align="center" justify="center">
                    <Button
                        size="compact-sm"
                        variant="filled"
                        onClick={() => showConnectionModal()}
                    >
                        <TbPlus />
                        <VisuallyHidden>Create connection</VisuallyHidden>
                    </Button>
                    <Title size="h2">Connections</Title>
                    {hasConnections && (
                        <Avatar size="sm" color={theme.primaryColor}>
                            {connections.length}
                        </Avatar>
                    )}
                </Group>
            </Group>

            <Stack gap={0} style={{ maxWidth: "48rem" }}>
                {connections.map((connection) => (
                    <ConnectionInfo
                        key={connection.address}
                        connection={connection}
                    />
                ))}

                {!hasConnections && (
                    <Text c="dimmed" py="sm">
                        Create your first connection.
                    </Text>
                )}
            </Stack>
        </>
    );
};

ConnectionView.displayName = "ConnectionView";

export default ConnectionView;
