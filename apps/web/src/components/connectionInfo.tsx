import { Button, Card, Flex, List, Text, useMantineTheme } from "@mantine/core";
import { FC } from "react";
import { TbNetwork, TbTrash } from "react-icons/tb";
import { useConnectionConfig } from "../providers/connectionConfig/hooks";
import { Connection } from "../providers/connectionConfig/types";
import Address from "./address";

interface ConnectionInfoProps {
    connection: Connection;
}

const defaultIconSize = 21 as const;

const ConnectionInfo: FC<ConnectionInfoProps> = ({ connection }) => {
    const { removeConnection } = useConnectionConfig();
    const theme = useMantineTheme();
    const iconSize = theme?.other?.iconSize ?? defaultIconSize;

    return (
        <Card withBorder py="lg" my="md" radius="sm" shadow="sm">
            <Card.Section inheritPadding withBorder>
                <Flex justify="space-between">
                    <Address value={connection.address} shorten icon />
                    <Button
                        justify="flex-end"
                        size="compact-sm"
                        variant="transparent"
                        color="red"
                        onClick={() => removeConnection(connection.address)}
                    >
                        <TbTrash size={iconSize} />
                    </Button>
                </Flex>
            </Card.Section>

            <List pt="sm" center>
                <List.Item icon={<TbNetwork size={iconSize} />}>
                    <Text style={{ lineBreak: "anywhere" }}>
                        {connection.url}
                    </Text>
                </List.Item>
            </List>
        </Card>
    );
};

export default ConnectionInfo;
