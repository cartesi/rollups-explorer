import {
    Avatar,
    Button,
    Collapse,
    Group,
    ScrollArea,
    Text,
    Title,
    VisuallyHidden,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useViewportSize } from "@mantine/hooks";
import { TbChevronDown, TbChevronUp, TbPlus } from "react-icons/tb";
import { useConnectionConfig } from "../../providers/connectionConfig/hooks";
import ConnectionInfo from "./connectionInfo";

const ConnectionView = () => {
    const [showConnectionList, { toggle: toggleConnectionList }] =
        useDisclosure(true);
    const { showConnectionModal } = useConnectionConfig();
    const { height: viewportHeight } = useViewportSize();
    const theme = useMantineTheme();
    const { listConnections } = useConnectionConfig();
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
                <Button variant="transparent" onClick={toggleConnectionList}>
                    {showConnectionList ? (
                        <>
                            <TbChevronUp size={theme.other.iconSize} />
                            <VisuallyHidden>Hide connections</VisuallyHidden>
                        </>
                    ) : (
                        <>
                            <TbChevronDown size={theme.other.iconSize} />
                            <VisuallyHidden>Show connections</VisuallyHidden>
                        </>
                    )}
                </Button>
            </Group>
            <Collapse in={showConnectionList}>
                <ScrollArea h={viewportHeight / 2} type="never">
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
                </ScrollArea>
            </Collapse>
        </>
    );
};

ConnectionView.displayName = "ConnectionView";

export default ConnectionView;
