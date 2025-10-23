import { useMantineColorScheme } from "@mantine/core";
import {
    connectorsForWallets,
    darkTheme,
    getDefaultWallets,
    lightTheme,
    RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import {
    argentWallet,
    ledgerWallet,
    trustWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http, WagmiProvider } from "wagmi";
import { foundry, mainnet, sepolia } from "wagmi/chains";

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
            wallets: [argentWallet, trustWallet, ledgerWallet],
        },
    ],
    connectorsForWalletsParameters,
);

const wagmiConfig = createConfig({
    ssr: true,
    connectors,
    chains: [foundry, mainnet, sepolia],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [foundry.id]: http(),
    },
});

const queryClient = new QueryClient();

const WalletProvider = ({ children }: { children: React.ReactNode }) => {
    const scheme = useMantineColorScheme();

    console.log("using config...");

    // XXX: make this match the mantine theme
    const themeOptions = {
        accentColor: "rgb(12, 133, 153)",
        borderRadius: "small",
    } as const;

    const walletTheme =
        scheme.colorScheme == "dark"
            ? darkTheme(themeOptions)
            : lightTheme(themeOptions);

    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider appInfo={appInfo} theme={walletTheme}>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};

export default WalletProvider;
