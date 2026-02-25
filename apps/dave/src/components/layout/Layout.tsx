"use client";
import {
    AppShell,
    AppShellHeader,
    AppShellMain,
    Burger,
    Button,
    Container,
    Divider,
    Group,
    NavLink,
    Stack,
    Text,
    useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
import { Activity, type FC, type PropsWithChildren } from "react";
import { TbCode, TbHome } from "react-icons/tb";
import { useIsSmallDevice } from "../../hooks/useIsSmallDevice";
import { useAppConfig } from "../../providers/AppConfigProvider";
import queryClient from "../../providers/queryClient";
import { pathBuilder } from "../../routes/routePathBuilder";
import { useSelectedNodeConnection } from "../connection/hooks";
import { ConnectWallet } from "../ConnectWallet";
import CartesiLogo from "../icons/CartesiLogo";
import PageLinks from "../navigation/PageLinks";
import SendModal from "../send/SendModal";
import { ConnectionSettings } from "../settings/ConnectionSettings";
import SettingsMenu from "../settings/SettingsMenu";
import { ThemeToggle } from "../ThemeToggle";

const printQueryInfo = () => {
    const defaultOpts = queryClient.getDefaultOptions();
    const queryCache = queryClient.getQueryCache();
    console.log(defaultOpts);
    console.log(queryCache);

    notifications.show({
        title: "Query cache printed",
        message: "Check your browser devtools console.",
    });
};

const logQueries = () => {
    const queries = queryClient.getQueryCache().getAll();
    const obj: object[] = [];
    // @ts-expect-error saving whatever is the original to reset.
    const orig = BigInt.prototype.toJSON;

    try {
        // @ts-expect-error JSON.stringify will try to call toJSON on bigints.  ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
        BigInt.prototype.toJSON = function () {
            return `$bigint:${this.toString()}`;
        };
    } catch (error) {
        console.log((error as Error).message);
    }

    queries.forEach((query) => {
        obj.push({ queryKey: query.queryKey, data: query.state.data });
    });

    try {
        console.log(JSON.stringify(obj, null, 4));
    } catch (error) {
        console.error(error);
    } finally {
        // @ts-expect-error just adding the original back.
        BigInt.prototype.toJSON = orig;
        notifications.show({
            title: "Queries as JSON requested!",
            message: "Check your browser devtools console.",
        });
    }
};

const Layout: FC<PropsWithChildren> = ({ children }) => {
    const theme = useMantineTheme();
    const [opened, { toggle: toggleMobileMenu, close: closeMobileMenu }] =
        useDisclosure();
    const selectedNodeConnection = useSelectedNodeConnection();
    const { isSmallDevice, viewport } = useIsSmallDevice();
    const { height } = viewport;
    const { isDebugEnabled } = useAppConfig();
    const navbarDefaults =
        theme.components?.AppShell?.defaultProps?.navbar ?? {};

    return (
        <>
            <SendModal />
            <AppShell
                navbar={{
                    ...navbarDefaults,
                    collapsed: { desktop: true, mobile: !opened },
                }}
            >
                <AppShellHeader style={{ zIndex: theme.other.zIndexXS }}>
                    <Group
                        h="100%"
                        justify="space-between"
                        align="center"
                        px={isSmallDevice ? "xs" : "xl"}
                    >
                        <Link href="/" aria-label="Home">
                            <CartesiLogo height={isSmallDevice ? 30 : 40} />
                        </Link>

                        <Burger
                            onClick={toggleMobileMenu}
                            hiddenFrom="sm"
                            aria-label="Navigation Menu"
                            opened={opened}
                        />

                        <Activity mode={isSmallDevice ? "hidden" : "visible"}>
                            <PageLinks />

                            <Group gap="3">
                                <Activity
                                    mode={
                                        selectedNodeConnection?.type ===
                                        "system_mock"
                                            ? "hidden"
                                            : "visible"
                                    }
                                >
                                    <ConnectWallet />
                                </Activity>
                                <SettingsMenu />
                                <Activity
                                    mode={isDebugEnabled ? "visible" : "hidden"}
                                >
                                    <Button onClick={printQueryInfo}>
                                        Show cache
                                    </Button>
                                    <Button onClick={logQueries}>
                                        Export queries
                                    </Button>
                                </Activity>
                            </Group>
                        </Activity>
                    </Group>
                </AppShellHeader>
                <AppShell.Navbar py="md" px={4}>
                    <Stack h="inherit" justify="space-between">
                        <Stack>
                            <NavLink
                                component={Link}
                                href={pathBuilder.home()}
                                label="Home"
                                leftSection={
                                    <TbHome size={theme.other.smIconSize} />
                                }
                                onClick={closeMobileMenu}
                            />

                            <NavLink
                                component={Link}
                                href={pathBuilder.specifications()}
                                label="Specs"
                                leftSection={
                                    <TbCode size={theme.other.smIconSize} />
                                }
                                onClick={closeMobileMenu}
                            />
                        </Stack>

                        <Stack px="sm">
                            <Stack px="sm">
                                <Divider label="Connection" />
                                <ConnectionSettings onClick={closeMobileMenu} />
                            </Stack>
                            <Divider />
                            <Group justify="space-between">
                                <Text>Wallet</Text>
                                <ConnectWallet showBalance={false} />
                            </Group>
                            <Group justify="space-between">
                                <Text>Dark Mode</Text>
                                <ThemeToggle />
                            </Group>
                        </Stack>
                    </Stack>
                </AppShell.Navbar>
                <AppShellMain>
                    <Container
                        px={isSmallDevice ? "lg" : "sm"}
                        mih={`calc(${height}px - var(--app-shell-header-height))`}
                        strategy="grid"
                    >
                        {children}
                    </Container>
                </AppShellMain>
            </AppShell>
        </>
    );
};

export default Layout;
