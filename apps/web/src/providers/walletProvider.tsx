"use client";
import { useMantineColorScheme } from "@mantine/core";
import {
    RainbowKitProvider,
    connectorsForWallets,
    darkTheme,
    getDefaultWallets,
    lightTheme,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import {
    argentWallet,
    ledgerWallet,
    trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { hardhat, mainnet, sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [
        ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
            ? [sepolia, hardhat]
            : [mainnet]),
    ],
    [publicProvider()],
);

const projectId = "bc37f90dfcefc2900e5a86d366bf9aea";
const { wallets } = getDefaultWallets({
    appName: "Cartesi Explorer",
    projectId,
    chains,
});

const appInfo = {
    appName: "Cartesi Rollups Explorer",
    learnMoreUrl: "https://rollups.cartesi.io",
};

const connectors = connectorsForWallets([
    ...wallets,
    {
        groupName: "Other",
        wallets: [
            argentWallet({ chains, projectId }),
            trustWallet({ chains, projectId }),
            ledgerWallet({ chains, projectId }),
        ],
    },
]);

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
});

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const scheme = useMantineColorScheme();
    const walletTheme =
        scheme.colorScheme == "dark" ? darkTheme() : lightTheme();

    return (
        <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider
                appInfo={appInfo}
                chains={chains}
                theme={walletTheme}
            >
                {children}
            </RainbowKitProvider>
        </WagmiConfig>
    );
};

export default WalletProvider;
