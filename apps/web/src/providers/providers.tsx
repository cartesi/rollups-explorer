"use client";

import { Provider as JotaiProvider } from "jotai";
import React, { useEffect } from "react";
import { initHighlightJSExtensions } from "./HighlightExtensionsStarter";
import { ConnectionConfigProvider } from "./connectionConfig/connectionConfigProvider";
import IndexedDbRepository from "./connectionConfig/indexedDbRepository";
import localRepository from "./connectionConfig/localRepository";
import GraphQLProvider from "./graphqlProvider";
import StyleProvider from "./styleProvider";
import WalletProvider from "./walletProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        initHighlightJSExtensions();
    }, []);

    return (
        <StyleProvider>
            <WalletProvider>
                <GraphQLProvider>
                    <JotaiProvider>
                        <ConnectionConfigProvider
                            repository={
                                typeof window !== "undefined" &&
                                window.indexedDB
                                    ? new IndexedDbRepository()
                                    : localRepository
                            }
                        >
                            {children}
                        </ConnectionConfigProvider>
                    </JotaiProvider>
                </GraphQLProvider>
            </WalletProvider>
        </StyleProvider>
    );
}
