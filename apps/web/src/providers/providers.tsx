"use client";
import React from "react";
import { ConnectionConfigProvider } from "./connectionConfig/connectionConfigProvider";
import GraphQLProvider from "./graphqlProvider";
import StyleProvider from "./styleProvider";
import WalletProvider from "./walletProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <StyleProvider>
            <WalletProvider>
                <GraphQLProvider>
                    <ConnectionConfigProvider>
                        {children}
                    </ConnectionConfigProvider>
                </GraphQLProvider>
            </WalletProvider>
        </StyleProvider>
    );
}
