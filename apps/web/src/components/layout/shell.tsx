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
    VisuallyHidden,
    useMantineColorScheme,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { FC, ReactNode } from "react";
import {
    TbAdjustmentsHorizontal,
    TbApps,
    TbArrowsDownUp,
    TbHome,
    TbInbox,
    TbMoonStars,
    TbPlugConnected,
    TbSun,
} from "react-icons/tb";
import { useAccount } from "wagmi";
import CartesiLogo from "../../components/cartesiLogo";
import Footer from "../../components/layout/footer";
import SendTransaction from "../../components/sendTransaction";

const Shell: FC<{ children: ReactNode }> = ({ children }) => {
    const [opened, { toggle: toggleMobileMenu }] = useDisclosure();
    const [
        transaction,
        {
            open: openTransaction,
            close: closeTransaction,
            toggle: toggleTransaction,
        },
    ] = useDisclosure(false);
    const theme = useMantineTheme();
    const showWalletNavbar = useMediaQuery(
        `(min-width:${theme.breakpoints.sm})`,
    );
    const showWalletSidebar = useMediaQuery(`(max-width:${767}px)`);
    const hideBalanceViewport = useMediaQuery(
        `(min-width:${theme.breakpoints.sm}) and (max-width:${50}em)`,
    );
    const { isConnected } = useAccount();
    const { colorScheme, toggleColorScheme } = useMantineColorScheme({
        keepTransitions: true,
    });
    const themeDefaultProps = theme.components?.AppShell?.defaultProps ?? {};

    return (
        <AppShell
            header={themeDefaultProps.header}
            navbar={{
                ...themeDefaultProps?.navbar,
                width: 180,
                collapsed: {
                    mobile: !opened,
                },
            }}
            padding="md"
        >
            <Modal
                opened={transaction}
                onClose={closeTransaction}
                title="Send Transaction"
            >
                <SendTransaction />
            </Modal>
            <AppShell.Header data-testid="header">
                <Group h="100%" px="md">
                    <Burger
                        data-testid="burger-menu-btn"
                        opened={opened}
                        onClick={toggleMobileMenu}
                        hiddenFrom="sm"
                        size="sm"
                    />
                    <Group justify="space-between" style={{ flex: 1 }}>
                        <Link href="/">
                            <CartesiLogo height={40} />
                        </Link>
                        <Group ml={{ lg: "xl" }} gap="md">
                            <Button
                                variant="subtle"
                                leftSection={<TbArrowsDownUp />}
                                onClick={openTransaction}
                                disabled={!isConnected}
                                visibleFrom="sm"
                                data-testid="transaction-button"
                            >
                                Send Transaction
                            </Button>
                            {showWalletNavbar && (
                                <ConnectButton
                                    showBalance={!hideBalanceViewport}
                                />
                            )}
                            <Switch
                                wrapperProps={{
                                    "data-testid": "theme-mode-switch",
                                }}
                                checked={colorScheme === "dark"}
                                onChange={() => toggleColorScheme()}
                                size="md"
                                onLabel={
                                    <>
                                        <VisuallyHidden>
                                            Light Mode
                                        </VisuallyHidden>
                                        <TbSun
                                            color={theme.white}
                                            size="1rem"
                                        />
                                    </>
                                }
                                offLabel={
                                    <>
                                        <VisuallyHidden>
                                            Dark Mode
                                        </VisuallyHidden>
                                        <TbMoonStars
                                            color={theme.colors.gray[6]}
                                            size="1rem"
                                        />
                                    </>
                                }
                            />
                        </Group>
                    </Group>
                </Group>
            </AppShell.Header>
            <AppShell.Navbar py="md" px={4} data-testid="navbar">
                <Stack px={13}>
                    <NavLink
                        component={Link}
                        label="Home"
                        href="/"
                        leftSection={<TbHome />}
                        onClick={toggleMobileMenu}
                        data-testid="home-link"
                    />

                    <NavLink
                        component={Link}
                        label="Applications"
                        onClick={toggleMobileMenu}
                        href="/applications"
                        leftSection={<TbApps />}
                        data-testid="applications-link"
                    />

                    <NavLink
                        component={Link}
                        label="Inputs"
                        onClick={toggleMobileMenu}
                        href="/inputs"
                        leftSection={<TbInbox />}
                        data-testid="inputs-link"
                    />

                    <NavLink
                        label="Settings"
                        leftSection={<TbAdjustmentsHorizontal />}
                        data-testid="settings-link"
                        childrenOffset="xs"
                    >
                        <NavLink
                            component={Link}
                            onClick={toggleMobileMenu}
                            label="Connections"
                            leftSection={<TbPlugConnected />}
                            href="/connections"
                            data-testid="connections-link"
                        />
                    </NavLink>

                    <NavLink
                        component="button"
                        data-testid="menu-item-send-transaction"
                        label="Send Transaction"
                        leftSection={<TbArrowsDownUp />}
                        disabled={!isConnected}
                        onClick={toggleTransaction}
                        hiddenFrom="sm"
                    />

                    {showWalletSidebar && <ConnectButton showBalance />}
                </Stack>
            </AppShell.Navbar>
            <AppShell.Main>{children}</AppShell.Main>
            <Footer />
        </AppShell>
    );
};
export default Shell;
