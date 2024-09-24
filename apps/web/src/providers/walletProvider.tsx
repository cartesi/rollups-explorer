"use client";
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
import "@rainbow-me/rainbowkit/styles.css";
import { ledgerWallet, trustWallet } from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Image from "next/image";
import { ReactNode } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { createConfig, fallback, http, WagmiProvider } from "wagmi";
import {
    arbitrum,
    arbitrumSepolia,
    base,
    baseSepolia,
    foundry,
    mainnet,
    optimism,
    optimismSepolia,
    sepolia,
} from "wagmi/chains";

// select chain based on env var
const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337");
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const chain =
    [
        foundry,
        mainnet,
        sepolia,
        optimism,
        optimismSepolia,
        base,
        baseSepolia,
        arbitrum,
        arbitrumSepolia,
    ].find((c) => c.id == chainId) || foundry;

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
const [defaultOptimismRpcUrl] = optimism.rpcUrls.default.http;
const [defaultOptimismSepoliaRpcUrl] = optimismSepolia.rpcUrls.default.http;
const [defaultBaseRpcUrl] = base.rpcUrls.default.http;
const [defaultBaseSepoliaRpcUrl] = baseSepolia.rpcUrls.default.http;
const [defaultArbitrumRpcUrl] = arbitrum.rpcUrls.default.http;
const [defaultArbitrumSepoliaRpcUrl] = arbitrumSepolia.rpcUrls.default.http;

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
        [optimism.id]: alchemyApiKey
            ? fallback([
                  http(`https://opt-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
                  http(defaultOptimismRpcUrl),
              ])
            : http(defaultOptimismRpcUrl),
        [optimismSepolia.id]: alchemyApiKey
            ? fallback([
                  http(`https://opt-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
                  http(defaultOptimismSepoliaRpcUrl),
              ])
            : http(defaultOptimismSepoliaRpcUrl),
        [base.id]: alchemyApiKey
            ? fallback([
                  http(
                      `https://base-mainnet.g.alchemy.com/v2/${alchemyApiKey}`,
                  ),
                  http(defaultBaseRpcUrl),
              ])
            : http(defaultBaseRpcUrl),
        [baseSepolia.id]: alchemyApiKey
            ? fallback([
                  http(
                      `https://base-sepolia.g.alchemy.com/v2/${alchemyApiKey}`,
                  ),
                  http(defaultBaseSepoliaRpcUrl),
              ])
            : http(defaultBaseSepoliaRpcUrl),
        [arbitrum.id]: alchemyApiKey
            ? fallback([
                  http(`https://arb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
                  http(defaultArbitrumRpcUrl),
              ])
            : http(defaultArbitrumRpcUrl),

        [arbitrumSepolia.id]: alchemyApiKey
            ? fallback([
                  http(`https://arb-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
                  http(defaultArbitrumSepoliaRpcUrl),
              ])
            : http(defaultArbitrumSepoliaRpcUrl),
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
