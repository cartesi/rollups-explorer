"use client";
import {
    ActionIcon,
    Group,
    Menu,
    Stack,
    Text,
    useMantineTheme,
    type ActionIconProps,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { FC } from "react";
import { TbSettings } from "react-icons/tb";
import { useSelectedNodeConnection } from "../connection/hooks";
import { ThemeToggle } from "../ThemeToggle";

interface SettingsMenuProps {
    buttonSize?: ActionIconProps["size"];
}

const SettingsMenu: FC<SettingsMenuProps> = ({ buttonSize = "input-sm" }) => {
    const theme = useMantineTheme();
    const [opened, handlers] = useDisclosure(false);
    const selectedNodeConnection = useSelectedNodeConnection();

    return (
        <Menu
            opened={opened}
            onClose={handlers.close}
            onDismiss={handlers.close}
            withArrow
            arrowSize={13}
            closeOnItemClick={false}
        >
            <Menu.Target>
                <ActionIcon
                    size={buttonSize}
                    onClick={(evt) => {
                        evt.stopPropagation();
                        evt.preventDefault();
                        handlers.toggle();
                    }}
                >
                    <TbSettings size={theme.other.mdIconSize} />
                </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Label>Connection</Menu.Label>
                <Menu.Item>
                    <Stack gap="xs">
                        <Group justify="space-between">
                            <Text fw="bold">Name</Text>
                            <Text>{selectedNodeConnection?.name}</Text>
                        </Group>
                        <Group justify="space-between">
                            <Text fw="bold">Chain</Text>
                            <Text>
                                {selectedNodeConnection?.chain ?? "n/a"}
                            </Text>
                        </Group>
                        <Group justify="space-between">
                            <Text fw="bold">Version</Text>
                            <Text>
                                {selectedNodeConnection?.version ?? "n/a"}
                            </Text>
                        </Group>
                    </Stack>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Label>Global</Menu.Label>
                <Menu.Item>
                    <Group justify="space-between">
                        <Text fw="bold">Dark mode</Text>
                        <ThemeToggle />
                    </Group>
                </Menu.Item>
            </Menu.Dropdown>
        </Menu>
    );
};

export default SettingsMenu;
