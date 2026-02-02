"use client";
import {
    AppShell,
    AppShellHeader,
    AppShellMain,
    Button,
    Container,
    Group,
    useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { Activity, type FC, type PropsWithChildren } from "react";
import { useIsSmallDevice } from "../../hooks/useIsSmallDevice";
import { useAppConfig } from "../../providers/AppConfigProvider";
import queryClient from "../../providers/queryClient";
import CartesiLogo from "../icons/CartesiLogo";
import SendModal from "../send/SendModal";
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
    const { isSmallDevice, viewport } = useIsSmallDevice();
    const { height } = viewport;
    const { isMockEnabled, isDebugEnabled } = useAppConfig();

    return (
        <>
            <SendModal />
            <AppShell>
                <AppShellHeader style={{ zIndex: theme.other.zIndexXS }}>
                    <Group
                        h="100%"
                        justify="space-between"
                        align="center"
                        px={isSmallDevice ? "xs" : "lg"}
                    >
                        <Link href="/" aria-label="Home">
                            <CartesiLogo height={isSmallDevice ? 30 : 40} />
                        </Link>

                        <Group>
                            <Activity
                                mode={isMockEnabled ? "hidden" : "visible"}
                            >
                                <ConnectButton
                                    showBalance={{
                                        smallScreen: false,
                                        largeScreen: true,
                                    }}
                                />
                            </Activity>
                            <ThemeToggle />
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
                    </Group>
                </AppShellHeader>
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
