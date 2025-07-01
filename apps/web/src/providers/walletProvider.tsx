"use client";
import { useMantineColorScheme } from "@mantine/core";
import { useMounted } from "@mantine/hooks";
import {
    AvatarComponent,
    connectorsForWallets,
    darkTheme,
    getDefaultWallets,
    lightTheme,
    RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { ThemeOptions } from "@rainbow-me/rainbowkit/dist/themes/baseTheme";
import "@rainbow-me/rainbowkit/styles.css";
import { ledgerWallet, trustWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { createConfig, WagmiProvider } from "wagmi";
import { foundry } from "wagmi/chains";
import getSupportedChainInfo, {
    SupportedChainId,
} from "../lib/supportedChains";
import createClientFor from "../lib/transportClient";
import { useAppConfig } from "./appConfigProvider";

// select chain based on env var
const chainId = parseInt(
    process.env.NEXT_PUBLIC_CHAIN_ID || "31337",
) as SupportedChainId;

const chain = getSupportedChainInfo(chainId) || foundry;

const projectId = "a6265c875f8a7513ac7c52362abf434b";

const connectorsForWalletsParameters = {
    appName: "CartesiScan",
    projectId,
};

const { wallets } = getDefaultWallets(connectorsForWalletsParameters);

const appInfo = {
    appName: connectorsForWalletsParameters.appName,
    learnMoreUrl: "https://cartesiscan.io",
};

const connectors = connectorsForWallets(
    [
        ...wallets,
        {
            groupName: "Other",
            wallets: [trustWallet, ledgerWallet],
        },
    ],
    connectorsForWalletsParameters,
);

const CustomAvatar: AvatarComponent = ({ address, size }) => {
    return <Jazzicon diameter={size} seed={jsNumberForAddress(address)} />;
};

const buildWagmiConfig = (nodeRpcUrl?: string) => {
    return createConfig({
        ssr: false,
        connectors,
        chains: [chain],
        client: ({ chain }) => createClientFor(chain, nodeRpcUrl),
    });
};

const queryClient = new QueryClient();

const WalletProvider = ({ children }: { children: ReactNode }) => {
    const scheme = useMantineColorScheme();
    const isMounted = useMounted();
    const appConfig = useAppConfig();
    const nodeRpcUrl = appConfig.nodeRpcUrl;

    // XXX: make this match the mantine theme
    const themeOptions: ThemeOptions = {
        accentColor: "rgb(12, 133, 153)",
        borderRadius: "small",
    };

    const wagmiConfig = useMemo(() => {
        return buildWagmiConfig(nodeRpcUrl);
    }, [nodeRpcUrl]);

    const walletTheme =
        scheme.colorScheme == "dark"
            ? darkTheme(themeOptions)
            : lightTheme(themeOptions);

    return isMounted ? (
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
