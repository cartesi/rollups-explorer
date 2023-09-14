"use client";
import {
    Burger,
    Flex,
    Switch,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FC } from "react";
import { TbMoonStars, TbSun } from "react-icons/tb";
import CartesiLogo from "./cartesiLogo";

const Header: FC = () => {
    const theme = useMantineTheme();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const [opened, { toggle }] = useDisclosure();

    return (
        <Flex justify="space-between" align="center" h="100%" p={20}>
            <CartesiLogo />

            <Flex direction="row" gap="md" align="center">
                <ConnectButton />
                <Switch
                    checked={colorScheme === "dark"}
                    onChange={() => toggleColorScheme()}
                    size="md"
                    onLabel={<TbSun color={theme.white} size="1rem" />}
                    offLabel={
                        <TbMoonStars color={theme.colors.gray[6]} size="1rem" />
                    }
                />

                <Burger
                    opened={opened}
                    onClick={toggle}
                    hiddenFrom="sm"
                    size="sm"
                />
            </Flex>
        </Flex>
    );
};

export default Header;
