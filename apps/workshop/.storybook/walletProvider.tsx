import { useMantineColorScheme } from "@mantine/core";
import {
    RainbowKitProvider,
    connectorsForWallets,
    darkTheme,
    getDefaultWallets,
    lightTheme,
} from "@rainbow-me/rainbowkit";
import { ThemeOptions } from "@rainbow-me/rainbowkit/dist/themes/baseTheme";
import "@rainbow-me/rainbowkit/styles.css";
import {
    argentWallet,
    ledgerWallet,
    trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { foundry, mainnet, sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

// only 1 chain is enabled, based on env var
const { chains, publicClient, webSocketPublicClient } = configureChains(
    [foundry, mainnet, sepolia],
    [publicProvider()],
);

const projectId = "a6265c875f8a7513ac7c52362abf434b";
const { wallets } = getDefaultWallets({
    appName: "CartesiScan",
    projectId,
    chains,
});

const appInfo = {
    appName: "CartesiScan",
    learnMoreUrl: "https://cartesiscan.io",
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
