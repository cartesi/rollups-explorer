"use client";
import { useEffect, useState, type ReactNode } from "react";
import { ConnectionProvider } from "../components/connection/ConnectionProvider";
import { SendProvider } from "../components/send/SendProvider";
import { getConfiguredCartesiNodeRpcUrl } from "../lib/getConfigCartesiNodeRpcUrl";
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

/**
 * This is a workaround to solve a problem when react-dom-client.development
 * is trying to stringify bigints.
 *
 * refer to issue {@link https://github.com/facebook/react/issues/35004}
 * a PR is currently open here {@link https://github.com/facebook/react/pull/35013}
 */
if (process.env.NODE_ENV === "development") {
    try {
        Object.defineProperty(BigInt.prototype, "toJSON", {
            writable: false,
            enumerable: true,
            configurable: false,
            value() {
                return this.toString();
            },
        });
    } catch (error: unknown) {
        console.info((error as Error).message);
    }
}

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
        cartesiNodeRpcUrl: getConfiguredCartesiNodeRpcUrl(),
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
                <ConnectionProvider>
                    <DataProvider>
                        <SendProvider>{children}</SendProvider>
                    </DataProvider>
                </ConnectionProvider>
            </AppConfigProvider>
        </StyleProvider>
    );
}
