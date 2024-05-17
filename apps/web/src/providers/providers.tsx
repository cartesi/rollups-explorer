"use client";
import React from "react";
import { ConnectionConfigProvider } from "./connectionConfig/connectionConfigProvider";
import GraphQLProvider from "./graphqlProvider";
import StyleProvider from "./styleProvider";
import WalletProvider from "./walletProvider";
import indexedDbRepository from "./connectionConfig/indexedDbRepository";
import localRepository from "./connectionConfig/localRepository";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <StyleProvider>
            <WalletProvider>
                <GraphQLProvider>
                    <ConnectionConfigProvider
                        repository={
                            typeof window !== "undefined" && window.indexedDB
                                ? indexedDbRepository
                                : localRepository
                        }
                    >
                        {children}
                    </ConnectionConfigProvider>
                </GraphQLProvider>
            </WalletProvider>
        </StyleProvider>
    );
}
