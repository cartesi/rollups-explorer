"use client";
import {
    AppShell,
    Burger,
    Button,
    Group,
    Modal,
    NavLink,
    Stack,
    Switch,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { FC, ReactNode } from "react";
import {
    TbApps,
    TbDotsVertical,
    TbHome,
    TbMoneybag,
    TbMoonStars,
    TbPigMoney,
    TbSun,
} from "react-icons/tb";
import { useAccount } from "wagmi";
import CartesiLogo from "../components/cartesiLogo";
import ConnectionView from "../components/connectionView";
import Footer from "../components/footer";
import SendTransaction from "../components/sendTransaction";

const Shell: FC<{ children: ReactNode }> = ({ children }) => {
    const [opened, { toggle }] = useDisclosure();
    const [menuOpened, { toggle: toggleMenu }] = useDisclosure(false);
    const [
        transaction,
        {
            open: openTransaction,
            close: closeTransaction,
            toggle: toggleTransaction,
        },
    ] = useDisclosure(false);
    const theme = useMantineTheme();
    const isSmallDevice = useMediaQuery(`(max-width:${theme.breakpoints.sm})`);
    const { isConnected } = useAccount();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const themeDefaultProps = theme.components?.AppShell?.defaultProps ?? {};

    return (
        <AppShell
            header={themeDefaultProps.header}
            navbar={{
                ...themeDefaultProps?.navbar,
                width: 200,
                collapsed: {
                    mobile: !opened,
                },
            }}
            aside={{
                ...themeDefaultProps?.aside,
                collapsed: {
                    desktop: !menuOpened,
                    mobile: !menuOpened,
                },
            }}
            padding="md"
        >
            <Modal
                opened={transaction}
                onClose={closeTransaction}
                title="Send Transaction"
                size="xl"
            >
                <SendTransaction />
            </Modal>
            <AppShell.Header data-testid="header">
                <Group h="100%" px="md">
                    <Burger
                        opened={opened}
                        onClick={toggle}
                        hiddenFrom="sm"
                        size="sm"
                    />
                    <Group justify="space-between" style={{ flex: 1 }}>
                        <Link href="/">
                            <CartesiLogo height={40} />
                        </Link>
                        <Group ml="xl" gap="md">
                            <Button
                                variant="subtle"
                                leftSection={<TbPigMoney />}
                                onClick={openTransaction}
                                disabled={!isConnected}
                            >
                                Send Transaction
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
                    <Button variant="subtle" onClick={toggleMenu}>
                        <TbDotsVertical size={theme.other.iconSize} />
                    </Button>
                </Group>
            </AppShell.Header>
            <AppShell.Aside p="md">
                <ConnectionView />
            </AppShell.Aside>
            <AppShell.Navbar py="md" px={4} data-testid="navbar">
                <Stack px={13}>
                    <NavLink
                        label="Home"
                        href="/"
                        leftSection={<TbHome />}
                        data-testid="home-link"
                    />

                    <NavLink
                        label="Applications"
                        href="/applications"
                        leftSection={<TbApps />}
                        data-testid="applications-link"
                    />

                    <NavLink
                        label="Send Transaction"
                        leftSection={<TbMoneybag />}
                        disabled={!isConnected}
                        opened={isConnected && transaction}
                        onClick={toggleTransaction}
                    />

                    {isSmallDevice && <ConnectButton showBalance />}
                </Stack>
            </AppShell.Navbar>
            <AppShell.Main>{children}</AppShell.Main>
            <Footer />
        </AppShell>
    );
};
export default Shell;
