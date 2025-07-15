import { isNilOrEmpty } from "ramda-adjunct";
import { foundry } from "viem/chains";
import getSupportedChainInfo, {
    SupportedChainId,
    supportedChains,
} from "./supportedChains";

/**
 * Simple function to run in both server and client environment
 *
 * @returns {String} Configured Chain Id
 */
const getConfiguredChainId = () => {
    const CHAIN_ID = process.env.CHAIN_ID || process.env.NEXT_PUBLIC_CHAIN_ID;
    const isNil = isNilOrEmpty(CHAIN_ID);
    const isSupported = getSupportedChainInfo(
        parseInt(CHAIN_ID ?? "") as SupportedChainId,
    );
    const chainId = isNil || !isSupported ? "31337" : CHAIN_ID;

    if (isNil) {
        console.warn(
            `Neither NEXT_PUBLIC_CHAIN_ID or CHAIN_ID are defined. ${foundry.id} will be used instead.`,
        );
    } else if (!isSupported) {
        console.warn(
            `The Chain id ${CHAIN_ID} is not supported. Supported Chains: [${Object.keys(supportedChains).join(", ")}]. ${foundry.id} will be used instead.`,
        );
    }

    return chainId;
};

export default getConfiguredChainId;
