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
    TbFileCode,
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
import getConfiguredChainId from "../../lib/getConfiguredChain";
import { CartesiScanChains } from "../networks/cartesiScanNetworks";

const Shell: FC<{ children: ReactNode }> = ({ children }) => {
    const [opened, { toggle: toggleMobileMenu, close: closeMobileMenu }] =
        useDisclosure();
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
    const { isConnected, chainId } = useAccount();
    const configuredChainId = getConfiguredChainId();
    const isValidNetwork = chainId === Number(configuredChainId);
    const { colorScheme, toggleColorScheme } = useMantineColorScheme({
        keepTransitions: true,
    });
    const isSmallDevice = useMediaQuery(`(max-width:${theme.breakpoints.xs})`);
    const themeDefaultProps = theme.components?.AppShell?.defaultProps ?? {};
    const footerZIndex = theme.other.footerZIndex ?? 102;

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
            <AppShell.Header data-testid="header" zIndex={110}>
                <Group h="100%" px="md">
                    <Burger
                        data-testid="burger-menu-btn"
                        aria-label="Navigation"
                        opened={opened}
                        onClick={toggleMobileMenu}
                        hiddenFrom="sm"
                    />
                    <Group justify="space-between" style={{ flex: 1 }}>
                        <Link href="/" aria-label="Home">
                            <CartesiLogo height={isSmallDevice ? 30 : 40} />
                        </Link>
                        <Group ml={{ lg: "xl" }}>
                            <CartesiScanChains onOpen={closeMobileMenu} />
                            <Button
                                variant="subtle"
                                leftSection={<TbArrowsDownUp />}
                                onClick={openTransaction}
                                disabled={!isConnected || !isValidNetwork}
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
                                label={
                                    <VisuallyHidden>
                                        Theme mode switch
                                    </VisuallyHidden>
                                }
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
            <AppShell.Navbar
                py="md"
                px={4}
                zIndex={isSmallDevice ? footerZIndex + 2 : "auto"}
                data-testid="navbar"
            >
                <Stack px={13}>
                    <NavLink
                        component={Link}
                        label="Home"
                        href="/"
                        leftSection={<TbHome />}
                        onClick={closeMobileMenu}
                        data-testid="home-link"
                    />

                    <NavLink
                        component={Link}
                        label="Applications"
                        onClick={closeMobileMenu}
                        href="/applications"
                        leftSection={<TbApps />}
                        data-testid="applications-link"
                    />

                    <NavLink
                        component={Link}
                        label="Inputs"
                        onClick={closeMobileMenu}
                        href="/inputs"
                        leftSection={<TbInbox />}
                        data-testid="inputs-link"
                    />

                    <NavLink
                        component={Link}
                        href="#"
                        label="Settings"
                        leftSection={<TbAdjustmentsHorizontal />}
                        data-testid="settings-link"
                        childrenOffset="xs"
                    >
                        <NavLink
                            component={Link}
                            onClick={closeMobileMenu}
                            label="Connections"
                            leftSection={<TbPlugConnected />}
                            href="/connections"
                            data-testid="connections-link"
                        />
                        <NavLink
                            component={Link}
                            onClick={closeMobileMenu}
                            label="Specs"
                            leftSection={<TbFileCode />}
                            href="/specifications"
                            data-testid="specifications-link"
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
