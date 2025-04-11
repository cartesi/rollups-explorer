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

export const supportedChains = Object.freeze({
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
});

export type SupportedChainId = keyof typeof supportedChains;

/**
 * Return information about a supported chain. Otherwise undefined is returned
 * @param { SupportedChainId } chainId
 * @returns
 */
const getSupportedChainInfo = (chainId: SupportedChainId) => {
    return supportedChains[chainId];
};

export default getSupportedChainInfo;
