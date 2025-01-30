"use client";
import {
    Card,
    Center,
    Flex,
    Grid,
    Group,
    Skeleton,
    Title,
} from "@mantine/core";
import { range } from "ramda";
import { FC } from "react";
import { useConnectionConfig } from "../../providers/connectionConfig/hooks";
import NewConnectionButton from "./components/NewConnectionButton";
import ConnectionInfo from "./connectionInfo";

const Feedback: FC = () => (
    <Grid justify="flex-start" align="stretch" data-testid="fetching-feedback">
        {range(0, 4).map((n) => (
            <Grid.Col span={{ base: 12, md: 6 }} key={n}>
                <Card>
                    <Group justify="space-between">
                        <Skeleton height={18} mb="xl" width="70%" />
                        <Skeleton height={18} mb="xl" width="5%" />
                    </Group>
                    <Skeleton height={18} my="xs" mb={0} />
                </Card>
            </Grid.Col>
        ))}
    </Grid>
);

const NoConnections: FC = () => {
    return (
        <Center>
            <Flex direction="column" align="center" justify="center" gap="sm">
                <Title order={3} c="dimmed">
                    No Connections Found!
                </Title>

                <NewConnectionButton data-testid="add-connection">
                    Create a connection
                </NewConnectionButton>
            </Flex>
        </Center>
    );
};

const ConnectionView = () => {
    const { listConnections, fetching } = useConnectionConfig();
    const connections = listConnections();
    const hasConnections = connections.length > 0;

    if (fetching) return <Feedback />;
    if (!hasConnections) return <NoConnections />;

    return (
        <>
            <Group justify="flex-start">
                <NewConnectionButton data-testid="add-connection">
                    Create connection
                </NewConnectionButton>
            </Group>

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
        </>
    );
};

ConnectionView.displayName = "ConnectionView";

export default ConnectionView;
