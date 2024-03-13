"use client";
import { useMantineColorScheme } from "@mantine/core";
import {
    AvatarComponent,
    RainbowKitProvider,
    // connectorsForWallets,
    darkTheme,
    // getDefaultWallets,
    lightTheme,
    getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { ThemeOptions } from "@rainbow-me/rainbowkit/dist/themes/baseTheme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";
// import { ledgerWallet, trustWallet } from "@rainbow-me/rainbowkit/wallets";
import Image from "next/image";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { WagmiProvider, http } from "wagmi";
import { foundry, mainnet, sepolia } from "wagmi/chains";
// import { alchemyProvider } from "wagmi/providers/alchemy";
// import { publicProvider } from "wagmi/providers/public";

// select chain based on env var
const chainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || "31337");
// const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const chain =
    [foundry, mainnet, sepolia].find((c) => c.id == chainId) || foundry;

// const providers: ChainProviderFn<typeof chain>[] = alchemyApiKey
//     ? [alchemyProvider({ apiKey: alchemyApiKey }), publicProvider()]
//     : [publicProvider()];

// only 1 chain is enabled, based on env var
// const { chains, publicClient, webSocketPublicClient } = configureChains(
//     [chain],
//     providers,
// );

const projectId = "a6265c875f8a7513ac7c52362abf434b";
// const { wallets } = getDefaultWallets({
//     appName: "CartesiScan",
//     projectId,
//     chains,
// });

const appInfo = {
    appName: "CartesiScan",
    learnMoreUrl: "https://cartesiscan.io",
};

// const connectors = connectorsForWallets(
//     [
//         ...wallets,
//         {
//             groupName: "Other",
//             wallets: [
//                 trustWallet({ chains, projectId }),
//                 ledgerWallet({ chains, projectId }),
//             ],
//         },
//     ],
//     {
//         appName: "CartesiScan",
//         projectId,
//     },
// );

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

const wagmiConfig = getDefaultConfig({
    appName: "CartesiScan",
    projectId,
    chains: [chain],
    transports: {
        [mainnet.id]: http(),
        [sepolia.id]: http(),
        [foundry.id]: http(),
    },
});

const queryClient = new QueryClient();

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
