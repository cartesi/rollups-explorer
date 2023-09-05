"use client";
import "@mantine/core/styles.css";
import React, { FC } from "react";
import { AppShell, ColorSchemeScript, Container } from "@mantine/core";

import Header from "../components/header";
import GraphQLProvider from "../providers/graphqlProvider";
import StyleProvider from "../providers/styleProvider";
import WalletProvider from "../providers/walletProvider";

const Layout: FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <html lang="en">
            <head>
                <ColorSchemeScript />
                <link rel="shortcut icon" href="/favicon.svg" />
            </head>
            <body>
                <StyleProvider>
                    <WalletProvider>
                        <GraphQLProvider>
                            <AppShell header={{ height: 80 }} padding="md">
                                <AppShell.Header>
                                    <Header />
                                </AppShell.Header>
                                <AppShell.Main>
                                    <Container>{children}</Container>
                                </AppShell.Main>
                            </AppShell>
                        </GraphQLProvider>
                    </WalletProvider>
                </StyleProvider>
            </body>
        </html>
    );
};

export default Layout;
