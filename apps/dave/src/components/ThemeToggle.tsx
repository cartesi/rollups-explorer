"use client";
import {
    Switch,
    Text,
    useMantineColorScheme,
    VisuallyHidden,
} from "@mantine/core";
import type { FC } from "react";

export const ThemeToggle: FC = () => {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    return (
        <Switch
            aria-label="Theme mode switch"
            checked={colorScheme === "dark"}
            onChange={() => toggleColorScheme()}
            size="md"
            onLabel={
                <>
                    <VisuallyHidden>Dark Mode</VisuallyHidden>
                    <Text fw="bold" tt="uppercase" size="xs">
                        on
                    </Text>
                </>
            }
            offLabel={
                <>
                    <VisuallyHidden>Light Mode</VisuallyHidden>
                    <Text fw="bold" tt="uppercase" size="xs">
                        off
                    </Text>
                </>
            }
        />
    );
};
