"use client";
import { isNotNilOrEmpty } from "ramda-adjunct";
import { useEffect, useState, type ReactNode } from "react";
import ConnectionModal from "../components/connection/ConnectionModal";
import { ConnectionProvider } from "../components/connection/ConnectionProvider";
import { useGetNodeInformation } from "../components/connection/hooks";
import type { NodeConnectionConfig } from "../components/connection/types";
import PageLoader from "../components/layout/PageLoader";
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

const defaultVal = {
    id: Number.MAX_SAFE_INTEGER,
    chain: 13370,
    isDeletable: false,
    isPreferred: true,
    timestamp: Date.now(),
    version: "2.0.0-alpha.9",
};

type UseSystemNodeConnectionReturn = {
    config: NodeConnectionConfig | null;
    isFetching?: boolean;
};

const useSystemNodeConnection = (
    cartesiNodeRpcUrl: string,
    isMockEnabled: boolean,
): UseSystemNodeConnectionReturn => {
    const url = isMockEnabled ? null : cartesiNodeRpcUrl;
    const result = useGetNodeInformation(url);

    if (isMockEnabled) {
        return {
            config: {
                ...defaultVal,
                name: "mocked-system-setup",
                type: "system_mock",
                url: "local://in-memory",
            },
        };
    }

    if (result.status === "pending") {
        return { config: null, isFetching: true };
    }

    if (isNotNilOrEmpty(cartesiNodeRpcUrl) && result.status === "success") {
        return {
            config: {
                ...defaultVal,
                name: "system-set-node-rpc",
                type: "system",
                url: cartesiNodeRpcUrl,
                chain: result.data.chainId,
                version: result.data.nodeVersion,
            },
        };
    }

    return { config: null };
};

export function Providers({ children }: ProviderProps) {
    const [value, setValue] = useState<AppConfigContextProps>({
        nodeRpcUrl: getConfiguredNodeRpcUrl(),
        cartesiNodeRpcUrl: getConfiguredCartesiNodeRpcUrl(),
        isDebugEnabled: getConfiguredDebugEnabled(),
        isMockEnabled: getConfiguredMockEnabled(),
    });

    const systemNodeResult = useSystemNodeConnection(
        value.cartesiNodeRpcUrl,
        value.isMockEnabled,
    );

    useEffect(() => {
        if (getConfiguredIsContainer()) {
            loadConfig()
                .then((result) => setValue(result))
                .catch((reason) => console.error(reason));
        }
    }, []);

    return (
        <StyleProvider>
            {systemNodeResult.isFetching ? (
                <PageLoader />
            ) : (
                <AppConfigProvider value={value}>
                    <ConnectionProvider
                        systemConnection={systemNodeResult.config}
                    >
                        <ConnectionModal />
                        <DataProvider>
                            <SendProvider>{children}</SendProvider>
                        </DataProvider>
                    </ConnectionProvider>
                </AppConfigProvider>
            )}
        </StyleProvider>
    );
}
