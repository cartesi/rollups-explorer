"use client";
import { ColorSchemeScript } from "@mantine/core";
import "@mantine/core/styles.css";
import React, { FC } from "react";

import GraphQLProvider from "../providers/graphqlProvider";
import StyleProvider from "../providers/styleProvider";
import WalletProvider from "../providers/walletProvider";
import Shell from "./shell";

const Layout: FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <html lang="en">
            <head>
                <ColorSchemeScript />
                <link rel="shortcut icon" href="/favicon.ico" />
            </head>
            <body>
                <StyleProvider>
                    <WalletProvider>
                        <GraphQLProvider>
                            <Shell>{children}</Shell>
                        </GraphQLProvider>
                    </WalletProvider>
                </StyleProvider>
            </body>
        </html>
    );
};

export default Layout;
