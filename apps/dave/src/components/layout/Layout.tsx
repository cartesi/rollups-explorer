"use client";

import {
    AppShell,
    AppShellHeader,
    AppShellMain,
    Container,
    Group,
    useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import type { FC, PropsWithChildren } from "react";
import { useIsSmallDevice } from "../../hooks/useIsSmallDevice";
import CartesiLogo from "../icons/CartesiLogo";

const Layout: FC<PropsWithChildren> = ({ children }) => {
    const theme = useMantineTheme();
    const { isSmallDevice, viewport } = useIsSmallDevice();
    const { height } = viewport;

    return (
        <AppShell>
            <AppShellHeader style={{ zIndex: theme.other.zIndexLG }}>
                <Group
                    h="100%"
                    justify="space-between"
                    align="center"
                    px={isSmallDevice ? "xs" : "lg"}
                >
                    <Link href="/" aria-label="Home">
                        <CartesiLogo height={isSmallDevice ? 30 : 40} />
                    </Link>
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
    );
};

export default Layout;
