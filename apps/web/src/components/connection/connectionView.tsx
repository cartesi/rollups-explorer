"use client";
import {
    Avatar,
    Button,
    Grid,
    Group,
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
                        data-testid="add-connection"
                        onClick={() => showConnectionModal()}
                    >
                        <TbPlus />
                        <VisuallyHidden>Create connection</VisuallyHidden>
                    </Button>

                    <Title data-testid="page-title" size="h2">
                        Connections
                    </Title>
                    {hasConnections && (
                        <Avatar size="sm" color={theme.primaryColor}>
                            {connections.length}
                        </Avatar>
                    )}
                </Group>
            </Group>

            {hasConnections ? (
                <Grid gutter="sm">
                    {connections.map((connection) => (
                        <Grid.Col
                            key={connection.address}
                            span={{ base: 12, sm: 6 }}
                            mt="md"
                        >
                            <ConnectionInfo connection={connection} />
                        </Grid.Col>
                    ))}
                </Grid>
            ) : (
                <Text c="dimmed" py="sm" ta="center">
                    No connections found.
                </Text>
            )}
        </>
    );
};

ConnectionView.displayName = "ConnectionView";

export default ConnectionView;
