import { Button, Group, Stack, Text } from "@mantine/core";
import { isNil } from "ramda";
import { useMemo, type FC } from "react";
import { useNodeConnection } from "../connection/hooks";
import CopyButton from "../CopyButton";

interface ConnectionSettingsProps {
    onClick: () => void;
}

export const ConnectionSettings: FC<ConnectionSettingsProps> = ({
    onClick,
}) => {
    const { getSelectedConnection, openConnectionModal } = useNodeConnection();
    const selectedNodeConnection = getSelectedConnection();
    const informations = useMemo(
        () => [
            {
                title: "Node RPC",
                value: selectedNodeConnection.url,
            },
            {
                title: "Chain RPC",
                value: selectedNodeConnection.chain.rpcUrl,
            },
        ],
        [selectedNodeConnection],
    );

    if (isNil(selectedNodeConnection)) return "";

    return (
        <Stack gap="xs">
            {informations.map((info) => (
                <Stack align="flex-start" gap="3" key={info.title}>
                    <Group gap={3} align="center">
                        <Text>{info.title}</Text>
                        <CopyButton value={info.value} disableTooltip />
                    </Group>

                    <Text
                        c="var(--mantine-color-anchor)"
                        size="sm"
                        style={{ wordBreak: "break-all" }}
                    >
                        {info.value}
                    </Text>
                </Stack>
            ))}
            <Group justify="flex-end">
                <Button
                    variant="transparent"
                    size="compact-md"
                    px={0}
                    onClick={() => {
                        onClick();
                        openConnectionModal();
                    }}
                >
                    <Text fw="bold" tt="uppercase">
                        manage
                    </Text>
                </Button>
            </Group>
        </Stack>
    );
};
