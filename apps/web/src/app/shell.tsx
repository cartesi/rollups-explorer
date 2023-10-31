"use client";
import { ERC20DepositForm } from "@cartesi/rollups-explorer-ui";
import {
    AppShell,
    Burger,
    Button,
    Drawer,
    Group,
    Modal,
    NavLink,
    Switch,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { FC, ReactNode } from "react";
import {
    TbApps,
    TbDotsVertical,
    TbHome,
    TbMoonStars,
    TbPigMoney,
    TbSun,
} from "react-icons/tb";
import { useAccount } from "wagmi";
import CartesiLogo from "../components/cartesiLogo";
import ConnectionView from "../components/connectionView";
import { useApplicationsQuery, useTokensQuery } from "../graphql";

const Shell: FC<{ children: ReactNode }> = ({ children }) => {
    const [opened, { toggle }] = useDisclosure();
    const [menu, { open: openMenu, close: closeMenu }] = useDisclosure(false);
    const [deposit, { open: openDeposit, close: closeDeposit }] =
        useDisclosure(false);
    const theme = useMantineTheme();
    const { isConnected } = useAccount();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const [{ data: applicationData }] = useApplicationsQuery();
    const applications = (applicationData?.applications ?? []).map((a) => a.id);
    const [{ data: tokenData }] = useTokensQuery();
    const tokens = (tokenData?.tokens ?? []).map(
        (a) => `${a.symbol} - ${a.name} - ${a.id}`,
    );

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{
                width: 300,
                breakpoint: "sm",
                collapsed: {
                    desktop: true,
                    mobile: !opened,
                },
            }}
            padding="md"
        >
            <Modal opened={deposit} onClose={closeDeposit} title="Deposit">
                <ERC20DepositForm applications={applications} tokens={tokens} />
            </Modal>
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
                        size="sm"
                    />
                    <Group justify="space-between" style={{ flex: 1 }}>
                        <CartesiLogo height={40} />
                        <Group ml="xl" gap="md" visibleFrom="sm">
                            <Link href="/">
                                <Button
                                    variant="subtle"
                                    leftSection={<TbHome />}
                                >
                                    Home
                                </Button>
                            </Link>
                            <Link href="/applications">
                                <Button
                                    variant="subtle"
                                    leftSection={<TbApps />}
                                >
                                    Applications
                                </Button>
                            </Link>
                            <Button
                                variant="subtle"
                                leftSection={<TbPigMoney />}
                                onClick={openDeposit}
                                disabled={!isConnected}
                            >
                                Deposit
                            </Button>
                            <ConnectButton />
                            <Switch
                                checked={colorScheme === "dark"}
                                onChange={() => toggleColorScheme()}
                                size="md"
                                onLabel={
                                    <TbSun color={theme.white} size="1rem" />
                                }
                                offLabel={
                                    <TbMoonStars
                                        color={theme.colors.gray[6]}
                                        size="1rem"
                                    />
                                }
                            />
                        </Group>
                    </Group>
                    <Button variant="subtle" onClick={openMenu}>
                        <TbDotsVertical size={theme.other.iconSize} />
                    </Button>
                    <Drawer opened={menu} onClose={closeMenu} position="right">
                        <ConnectionView />
                    </Drawer>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar py="md" px={4}>
                <NavLink label="Home" href="/" leftSection={<TbHome />} />
                <NavLink
                    disabled
                    label="Deposit"
                    href="/deposit"
                    leftSection={<TbPigMoney />}
                />
                <ConnectButton />
            </AppShell.Navbar>
            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
};
export default Shell;
