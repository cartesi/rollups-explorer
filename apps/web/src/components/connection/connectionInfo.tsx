import {
    Button,
    Card,
    Flex,
    Group,
    List,
    Modal,
    Text,
    VisuallyHidden,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FC } from "react";
import { TbNetwork, TbTrash } from "react-icons/tb";
import { useConnectionConfig } from "../../providers/connectionConfig/hooks";
import { Connection } from "../../providers/connectionConfig/types";
import Address from "../address";

interface ConnectionInfoProps {
    connection: Connection;
}

const ConnectionInfo: FC<ConnectionInfoProps> = ({ connection }) => {
    const { removeConnection } = useConnectionConfig();
    const theme = useMantineTheme();
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                title="Delete connection?"
                centered
            >
                <Text>
                    This will delete the data for this connection. Are you sure
                    you want to proceed?
                </Text>

                <Group mt="xl" justify="flex-end">
                    <Button variant="default" onClick={close}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => {
                            removeConnection(connection.address);
                            close();
                        }}
                    >
                        Confirm
                    </Button>
                </Group>
            </Modal>

            <Card
                withBorder
                py="lg"
                radius="sm"
                shadow="sm"
                data-testid="connection-card"
            >
                <Card.Section inheritPadding withBorder>
                    <Flex justify="space-between">
                        <Address value={connection.address} shorten icon />
                        <Button
                            aria-label={`remove-${connection.address}`}
                            role="button"
                            justify="flex-end"
                            size="compact-sm"
                            variant="transparent"
                            color="red"
                            data-testid="remove-connection"
                            onClick={open}
                        >
                            <TbTrash size={theme.other.iconSize} />
                            <VisuallyHidden>
                                Remove connection for address{" "}
                                {connection.address}
                            </VisuallyHidden>
                        </Button>
                    </Flex>
                </Card.Section>

                <List pt="sm" center>
                    <List.Item icon={<TbNetwork size={theme.other.iconSize} />}>
                        <Text style={{ lineBreak: "anywhere" }}>
                            {connection.url}
                        </Text>
                    </List.Item>
                </List>
            </Card>
        </>
    );
};

export default ConnectionInfo;
