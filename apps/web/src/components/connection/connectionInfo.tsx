import {
    Button,
    Card,
    Flex,
    List,
    Text,
    VisuallyHidden,
    useMantineTheme,
} from "@mantine/core";
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
    return (
        <Card withBorder py="lg" mt="md" radius="sm" shadow="sm">
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
                        onClick={() => removeConnection(connection.address)}
                    >
                        <TbTrash size={theme.other.iconSize} />
                        <VisuallyHidden>
                            Remove connection for address {connection.address}
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
    );
};

export default ConnectionInfo;
