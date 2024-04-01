"use client";
import { ReactNode } from "react";
import { useMantineColorScheme } from "@mantine/core";
import {
    AvatarComponent,
    connectorsForWallets,
    darkTheme,
    getDefaultWallets,
    lightTheme,
    RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { ThemeOptions } from "@rainbow-me/rainbowkit/dist/themes/baseTheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";
import { ledgerWallet, trustWallet } from "@rainbow-me/rainbowkit/wallets";
import Image from "next/image";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { createConfig, fallback, http, WagmiProvider } from "wagmi";
import { foundry, mainnet, sepolia } from "wagmi/chains";
import { Transport } from "viem";

// select chain based on env var
const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337");
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const chain =
    [foundry, mainnet, sepolia].find((c) => c.id == chainId) || foundry;

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

const CustomAvatar: AvatarComponent = ({ address, ensImage, size }) => {
    return ensImage ? (
        <Image
            src={ensImage}
            width={size}
            height={size}
            style={{ borderRadius: 999 }}
            alt={address}
        />
    ) : (
        <Jazzicon diameter={size} seed={jsNumberForAddress(address)} />
    );
};

const [defaultMainnetRpcUrl] = mainnet.rpcUrls.default.http;
const [defaultSepoliaRpcUrl] = sepolia.rpcUrls.default.http;
const [defaultFoundryRpcUrl] = foundry.rpcUrls.default.http;

const wagmiConfig = createConfig({
    ssr: true,
    connectors,
    chains: [chain],
    transports: {
        [mainnet.id]: alchemyApiKey
            ? fallback([
                  http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
                  http(defaultMainnetRpcUrl),
              ])
            : http(defaultMainnetRpcUrl),
        [sepolia.id]: alchemyApiKey
            ? fallback([
                  http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
                  http(defaultSepoliaRpcUrl),
              ])
            : http(defaultSepoliaRpcUrl),
        [foundry.id]: http(defaultFoundryRpcUrl),
    },
});

const queryClient = new QueryClient();

const WalletProvider = ({ children }: { children: ReactNode }) => {
    const scheme = useMantineColorScheme();

    // XXX: make this match the mantine theme
    const themeOptions: ThemeOptions = {
        accentColor: "rgb(12, 133, 153)",
        borderRadius: "small",
    };

    const walletTheme =
        scheme.colorScheme == "dark"
            ? darkTheme(themeOptions)
            : lightTheme(themeOptions);

    return (
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
    );
};

export default WalletProvider;
