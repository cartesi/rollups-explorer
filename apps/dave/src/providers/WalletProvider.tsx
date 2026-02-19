"use client";
import { useMounted } from "@mantine/hooks";
import {
    connectorsForWallets,
    getDefaultWallets,
    RainbowKitProvider,
    type AvatarComponent,
    type Chain,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { trustWallet } from "@rainbow-me/rainbowkit/wallets";
import { hasPath, isNotNil } from "ramda";
import { useMemo, type ReactNode } from "react";
import Jazzicon, { jsNumberForAddress } from "react-jazzicon";
import { createConfig, WagmiProvider } from "wagmi";
import { useSelectedNodeConnection } from "../components/connection/hooks";
import type { DbNodeConnectionConfig } from "../components/connection/types";
import getSupportedChainInfo, {
    defaultSupportedChain,
    isDevnet,
    type SupportedChain,
    type SupportedChainId,
} from "../lib/supportedChains";
import createClientFor from "../lib/transportClient";

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

/**
 * Override specific selected supported-chains information.
 * so the user has a better experience with wallet flow
 * e.g (create a custom network if one does not exist)
 * @param chain
 * @param overrides
 * @returns
 */
const upgradeChainInfo = (chain: SupportedChain, overrides: Partial<Chain>) => {
    const customChain = {
        ...chain,
        ...overrides,
    } as const satisfies Chain;

    return customChain as SupportedChain;
};

type ChainRpcUrls = Chain["rpcUrls"]["default"];

/**
 * Setup the rpcUrls for the Chain configuration.
 * Enhacing the wallet experience as the wallet vendor will ask if the user
 * wants to add the network (chain-name + connection-name) to the wallet in case it does not exist.
 * caveats: The way wallets works(specifically metamask) is as follow:
 * if a chain-id is already registered the wallet will connect to that one
 * even if the rpc-url does not match.
 * @param chain
 * @param nodeRpcUrl
 * @returns
 */
const buildChainRpcUrls = (
    chain: SupportedChain,
    nodeRpcUrl: string,
): ChainRpcUrls => {
    const config: ChainRpcUrls = { http: [nodeRpcUrl] };
    if (hasPath(["rpcUrls", "default", "webSocket"], chain)) {
        // TODO: Add option in the connection-form for user to add the websocket
        const httpProtocolReg = /http:\/\//gi;
        const httpsProtocolReg = /https:\/\//gi;
        if (httpProtocolReg.test(nodeRpcUrl)) {
            config.webSocket = [nodeRpcUrl.replace(httpProtocolReg, "ws://")];
        } else if (httpsProtocolReg.test(nodeRpcUrl)) {
            config.webSocket = [nodeRpcUrl.replace(httpsProtocolReg, "wss://")];
        }
    }
    return config;
};

const buildWagmiConfig = (
    selectedNodeConnection: DbNodeConnectionConfig | null,
) => {
    const id =
        (selectedNodeConnection?.chain.id as SupportedChainId) ??
        defaultSupportedChain.id;
    const nodeRpcUrl = selectedNodeConnection?.chain.rpcUrl;
    const supportedChain = getSupportedChainInfo(id) || defaultSupportedChain;
    const chain =
        isNotNil(selectedNodeConnection) &&
        isNotNil(nodeRpcUrl) &&
        isDevnet(selectedNodeConnection.chain.id)
            ? upgradeChainInfo(supportedChain, {
                  name: `${supportedChain.name} (${selectedNodeConnection.name})`,
                  rpcUrls: {
                      default: buildChainRpcUrls(supportedChain, nodeRpcUrl),
                  },
              })
            : supportedChain;

    return createConfig({
        ssr: true,
        connectors,
        chains: [chain],
        client: ({ chain }) => createClientFor(chain, nodeRpcUrl),
    });
};

const WalletProvider = ({ children }: { children: ReactNode }) => {
    const isMounted = useMounted();
    const selectedConnection = useSelectedNodeConnection();

    const wagmiConfig = useMemo(() => {
        return buildWagmiConfig(selectedConnection);
    }, [selectedConnection]);

    return isMounted ? (
        <WagmiProvider
            config={wagmiConfig}
            key={selectedConnection?.id ?? "none"}
        >
            <RainbowKitProvider appInfo={appInfo} avatar={CustomAvatar}>
                {children}
            </RainbowKitProvider>
        </WagmiProvider>
    ) : null;
};

export default WalletProvider;
