"use client";
import {
    ActionIcon,
    Group,
    Menu,
    Text,
    useMantineTheme,
    type ActionIconProps,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type { FC } from "react";
import { TbSettings } from "react-icons/tb";
import { ThemeToggle } from "../ThemeToggle";
import { ConnectionSettings } from "./ConnectionSettings";
import classes from "./Menu.module.css";

interface SettingsMenuProps {
    buttonSize?: ActionIconProps["size"];
}

const SettingsMenu: FC<SettingsMenuProps> = ({ buttonSize = "input-sm" }) => {
    const theme = useMantineTheme();
    const [opened, handlers] = useDisclosure(false);

    return (
        <Menu
            opened={opened}
            onClose={handlers.close}
            onDismiss={handlers.close}
            withArrow
            arrowSize={13}
            closeOnItemClick={false}
            withOverlay={false}
            classNames={{ item: classes.item }}
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

            <Menu.Dropdown miw="18rem">
                <Menu.Label>Connection</Menu.Label>
                <Menu.Item component="div">
                    <ConnectionSettings onClick={handlers.close} />
                </Menu.Item>
                <Menu.Divider />
                <Menu.Label>Global</Menu.Label>
                <Menu.Item component="div">
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
