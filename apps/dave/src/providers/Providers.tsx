"use client";
import { useEffect, useState, type ReactNode } from "react";
import { SendProvider } from "../components/send/SendProvider";
import { getConfiguredDebugEnabled } from "../lib/getConfigDebugEnabled";
import { getConfiguredIsContainer } from "../lib/getConfigIsContainer";
import { getConfiguredMockEnabled } from "../lib/getConfigMockEnabled";
import { getConfiguredNodeRpcUrl } from "../lib/getConfigNodeRpcUrl";
import {
    AppConfigProvider,
    type AppConfigContextProps,
} from "./AppConfigProvider";
import DataProvider from "./DataProvider";
import { StyleProvider } from "./StyleProvider";
import WalletProvider from "./WalletProvider";

type ProviderProps = { children: ReactNode };

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/";

type Config = {
    cartesiNodeRpcUrl: string;
    nodeRpcUrl: string;
    isMockEnabled: boolean;
    isDebugEnabled: boolean;
};

const loadConfig = async () => {
    const { origin } = window.location;
    const url = `${origin}${basePath}${basePath.endsWith("/") ? "api/config" : "/api/config"}`;
    const config: Config = await fetch(url).then((r) => r.json());
    return config;
};

export function Providers({ children }: ProviderProps) {
    const [value, setValue] = useState<AppConfigContextProps>({
        nodeRpcUrl: getConfiguredNodeRpcUrl(),
        cartesiNodeRpcUrl: getConfiguredNodeRpcUrl(),
        isDebugEnabled: getConfiguredDebugEnabled(),
        isMockEnabled: getConfiguredMockEnabled(),
    });

    useEffect(() => {
        if (getConfiguredIsContainer()) {
            loadConfig()
                .then((result) => setValue(result))
                .catch((reason) => console.error(reason));
        }
    }, []);

    return (
        <StyleProvider>
            <AppConfigProvider value={value}>
                <DataProvider>
                    <WalletProvider>
                        <SendProvider>{children}</SendProvider>
                    </WalletProvider>
                </DataProvider>
            </AppConfigProvider>
        </StyleProvider>
    );
}
