"use client";

import { Provider as JotaiProvider } from "jotai";
import { ReactNode, useEffect, useState } from "react";
import { getConfiguredPublicExplorerAPI } from "../lib/getConfigExplorerAPIUrl";
import { getConfiguredIsContainer } from "../lib/getConfigIsContainer";
import { getConfiguredNodeRpcUrl } from "../lib/getConfigNodeRpcUrl";
import { initHighlightJSExtensions } from "./HighlightExtensionsStarter";
import { AppConfigContextProps, AppConfigProvider } from "./appConfigProvider";
import { ConnectionConfigProvider } from "./connectionConfig/connectionConfigProvider";
import IndexedDbRepository from "./connectionConfig/indexedDbRepository";
import localRepository from "./connectionConfig/localRepository";
import GraphQLProvider from "./graphqlProvider";
import StyleProvider from "./styleProvider";
import WalletProvider from "./walletProvider";
interface ProvidersProps {
    children: ReactNode;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/";

type Config = { apiEndpoint: string; nodeRpcUrl: string };

const loadConfig = async () => {
    const { origin } = window.location;
    const url = `${origin}${basePath}${basePath.endsWith("/") ? "api/config" : "/api/config"}`;
    const config: Config = await fetch(url).then((r) => r.json());
    return config;
};

export function Providers({ children }: ProvidersProps) {
    const [value, setValue] = useState<AppConfigContextProps>({
        apiEndpoint: getConfiguredPublicExplorerAPI(),
        nodeRpcUrl: getConfiguredNodeRpcUrl(),
    });

    useEffect(() => {
        if (getConfiguredIsContainer()) {
            loadConfig()
                .then((result) => setValue(result))
                .catch((reason) => console.error(reason));
        }
        initHighlightJSExtensions();
    }, []);

    return (
        <StyleProvider>
            <AppConfigProvider value={value}>
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
            </AppConfigProvider>
        </StyleProvider>
    );
}
