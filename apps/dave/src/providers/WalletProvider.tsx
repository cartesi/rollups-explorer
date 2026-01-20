"use client";
import { useChainId } from "@cartesi/wagmi";
import { useMantineColorScheme } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import {
    connectorsForWallets,
    darkTheme,
    getDefaultWallets,
    lightTheme,
    RainbowKitProvider,
    type AvatarComponent,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { trustWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClientProvider } from "@tanstack/react-query";
import { useMemo, type ReactNode } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { createConfig, WagmiProvider } from "wagmi";
import getSupportedChainInfo, {
    defaultSupportedChain,
    type SupportedChainId,
} from "../lib/supportedChains";
import createClientFor from "../lib/transportClient";
import { useAppConfig } from "./AppConfigProvider";
import queryClient from "./queryClient";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;

const connectorsForWalletsParameters = {
    appName: "RollupsExplorer",
    projectId,
};

const { wallets } = getDefaultWallets(connectorsForWalletsParameters);

const appInfo = {
    appName: connectorsForWalletsParameters.appName,
    learnMoreUrl: "https://dave-demo.cartesi.io",
};

const connectors = connectorsForWallets(
    [
        ...wallets,
        {
            groupName: "Other",
            wallets: [trustWallet],
        },
    ],
    connectorsForWalletsParameters,
);

const CustomAvatar: AvatarComponent = ({ address, size }) => {
    return <Jazzicon diameter={size} seed={jsNumberForAddress(address)} />;
};

const buildWagmiConfig = (chainId: string, nodeRpcUrl?: string) => {
    const id = parseInt(chainId) as SupportedChainId;
    const chain = getSupportedChainInfo(id) || defaultSupportedChain;
    return createConfig({
        ssr: true,
        connectors,
        chains: [chain],
        client: ({ chain }) => createClientFor(chain, nodeRpcUrl),
    });
};

const WalletProvider = ({ children }: { children: ReactNode }) => {
    const scheme = useMantineColorScheme();
    const isMounted = useMounted();
    const appConfig = useAppConfig();
    const nodeRpcUrl = appConfig.nodeRpcUrl;
    const { data, isLoading } = useChainId({});
    const chainId = data?.toString() ?? defaultSupportedChain.id.toString();

    const themeOptions = {
        accentColor: "rgb(12, 133, 153)",
        borderRadius: "small",
    } as const;

    const wagmiConfig = useMemo(() => {
        return buildWagmiConfig(chainId, nodeRpcUrl);
    }, [nodeRpcUrl, chainId]);

    const walletTheme =
        scheme.colorScheme == "dark"
            ? darkTheme(themeOptions)
            : lightTheme(themeOptions);

    return isMounted && !isLoading ? (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    appInfo={appInfo}
                    theme={walletTheme}
                    avatar={CustomAvatar}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    ) : null;
};

export default WalletProvider;
