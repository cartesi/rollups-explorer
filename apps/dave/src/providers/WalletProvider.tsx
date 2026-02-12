"use client";
import { useMounted } from "@mantine/hooks";
import {
    connectorsForWallets,
    getDefaultWallets,
    RainbowKitProvider,
    type AvatarComponent,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { trustWallet } from "@rainbow-me/rainbowkit/wallets";
import { useMemo, type ReactNode } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { createConfig, WagmiProvider } from "wagmi";
import { useSelectedNodeConnection } from "../components/connection/hooks";
import getSupportedChainInfo, {
    defaultSupportedChain,
    type SupportedChainId,
} from "../lib/supportedChains";
import createClientFor from "../lib/transportClient";
import { useAppConfig } from "./AppConfigProvider";

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
    const isMounted = useMounted();
    const appConfig = useAppConfig();
    const selectedConnection = useSelectedNodeConnection();
    const nodeRpcUrl = appConfig.nodeRpcUrl;
    const data = selectedConnection?.chain;
    const chainId = data?.toString() ?? defaultSupportedChain.id.toString();

    const wagmiConfig = useMemo(() => {
        return buildWagmiConfig(chainId, nodeRpcUrl);
    }, [nodeRpcUrl, chainId]);

    return isMounted ? (
        <WagmiProvider config={wagmiConfig}>
            <RainbowKitProvider appInfo={appInfo} avatar={CustomAvatar}>
                {children}
            </RainbowKitProvider>
        </WagmiProvider>
    ) : null;
};

export default WalletProvider;
