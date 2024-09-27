import { isNotNilOrEmpty } from "ramda-adjunct";
import { fallback, http } from "viem";
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
} from "viem/chains";
import getSupportedChainInfo, {
    type SupportedChainId,
} from "./supportedChains";

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const alchemyUrlByChainId = {
    [mainnet.id]: "https://eth-mainnet.g.alchemy.com/v2/",
    [sepolia.id]: "https://eth-sepolia.g.alchemy.com/v2/",
    [optimism.id]: "https://opt-mainnet.g.alchemy.com/v2/",
    [optimismSepolia.id]: "https://opt-sepolia.g.alchemy.com/v2/",
    [base.id]: "https://base-mainnet.g.alchemy.com/v2/",
    [baseSepolia.id]: "https://base-sepolia.g.alchemy.com/v2/",
    [arbitrum.id]: "https://arb-mainnet.g.alchemy.com/v2/",
    [arbitrumSepolia.id]: "https://arb-sepolia.g.alchemy.com/v2/",
};

type SupportedAlchemyChains = keyof typeof alchemyUrlByChainId;

const getAlchemyUrl = (
    chainId: SupportedAlchemyChains,
    alchemyApiKey: string,
) => {
    const url = alchemyUrlByChainId[chainId];
    return url ? `${url}${alchemyApiKey}` : null;
};

/**
 * Returns a http fallback transport type for Viem client configuration based on chainId
 * @param {SupportedChainId} chainId
 * @returns
 */
const buildTransport = (chainId: SupportedChainId) => {
    const chain = getSupportedChainInfo(chainId);

    if (!chain) throw new Error(`Unsupported chain id: ${chainId}`);

    const httpList = [http(chain.rpcUrls.default.http[0])];

    if (isNotNilOrEmpty(alchemyApiKey) && chain.id !== foundry.id) {
        const url = getAlchemyUrl(chain.id, alchemyApiKey);
        if (url) httpList.push(http(url));
    }

    return fallback(httpList);
};

export default buildTransport;
