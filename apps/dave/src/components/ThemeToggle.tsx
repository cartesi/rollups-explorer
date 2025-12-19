"use client";
import { Switch, useMantineColorScheme, VisuallyHidden } from "@mantine/core";
import type { FC } from "react";
import { TbMoonStars, TbSun } from "react-icons/tb";

export const ThemeToggle: FC = () => {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    return (
        <Switch
            label={<VisuallyHidden>Theme mode switch</VisuallyHidden>}
            checked={colorScheme === "light"}
            onChange={() => toggleColorScheme()}
            size="md"
            onLabel={
                <>
                    <VisuallyHidden>Dark Mode</VisuallyHidden>
                    <TbMoonStars size="1rem" />
                </>
            }
            offLabel={
                <>
                    <VisuallyHidden>Light Mode</VisuallyHidden>
                    <TbSun size="1rem" />
                </>
            }
        />
    );
};
