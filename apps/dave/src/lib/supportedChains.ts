import { pathOr } from "ramda";
import {
    arbitrum,
    arbitrumSepolia,
    base,
    baseSepolia,
    cannon,
    foundry,
    mainnet,
    optimism,
    optimismSepolia,
    sepolia,
} from "viem/chains";

export const supportedDevnets = [foundry, cannon];
export const supportedChains = {
    [mainnet.id]: mainnet,
    [sepolia.id]: sepolia,
    [base.id]: base,
    [baseSepolia.id]: baseSepolia,
    [optimism.id]: optimism,
    [optimismSepolia.id]: optimismSepolia,
    [foundry.id]: foundry,
    [cannon.id]: cannon,
    [arbitrum.id]: arbitrum,
    [arbitrumSepolia.id]: arbitrumSepolia,
} as const;

export type SupportedChainId = keyof typeof supportedChains;
export type SupportedChain = (typeof supportedChains)[SupportedChainId];

/**
 * Return information about a supported chain. Otherwise undefined is returned
 * @param { SupportedChainId } chainId
 * @returns
 */
const getSupportedChainInfo = (chainId: SupportedChainId): SupportedChain => {
    return supportedChains[chainId];
};

export const defaultSupportedChain = foundry;

type CheckChainIdReturn =
    | {
          status: "not-supported-chain";
          error: Error;
      }
    | {
          status: "supported";
          chain: SupportedChain;
      };

/**
 * Check if chain-id supplied is supported
 * @param chainId
 * @returns
 */
export const checkChainId = (chainId: number): CheckChainIdReturn => {
    const chain = pathOr(null, [chainId], supportedChains);
    if (!chain) {
        return {
            status: "not-supported-chain",
            error: new Error(
                `${chainId} is not supported. Supported chains: [ ${Object.keys(supportedChains).join(", ")} ]`,
            ),
        };
    }

    return {
        status: "supported",
        chain,
    };
};

export const isDevnet = (chainId: number): boolean => {
    return supportedDevnets.some((chain) => chain.id === chainId);
};

export default getSupportedChainInfo;
