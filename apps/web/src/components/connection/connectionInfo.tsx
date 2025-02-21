import {
    Button,
    Card,
    Flex,
    List,
    Text,
    useMantineTheme,
    VisuallyHidden,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FC } from "react";
import { TbNetwork, TbTrash } from "react-icons/tb";
import { useConnectionConfig } from "../../providers/connectionConfig/hooks";
import { Connection } from "../../providers/connectionConfig/types";
import Address from "../address";
import { DeleteConnectionModal } from "./deleteConnectionModal";

interface ConnectionInfoProps {
    connection: Connection;
}

const ConnectionInfo: FC<ConnectionInfoProps> = ({ connection }) => {
    const { removeConnection } = useConnectionConfig();
    const theme = useMantineTheme();
    const [opened, { open, close }] = useDisclosure(false);

    return (
        <>
            <DeleteConnectionModal
                isOpened={opened}
                onClose={close}
                onConfirm={() => {
                    removeConnection(connection.address);
                    close();
                }}
            />

            <Card
                withBorder
                radius="sm"
                shadow="sm"
                data-testid="connection-card"
            >
                <Card.Section withBorder py={4}>
                    <Flex justify="space-between" pl={12}>
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

                <Card.Section py="md" px="sm">
                    <List center>
                        <List.Item
                            icon={<TbNetwork size={theme.other.iconSize} />}
                        >
                            <Text style={{ lineBreak: "anywhere" }}>
                                {connection.url}
                            </Text>
                        </List.Item>
                    </List>
                </Card.Section>
            </Card>
        </>
    );
};

export default ConnectionInfo;
