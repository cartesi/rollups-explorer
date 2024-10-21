import { isNilOrEmpty } from "ramda-adjunct";
import { foundry } from "viem/chains";

/**
 * Simple function (not a hook) to be reused through out the app to share
 * the configured chain id. This will ease the transition to the aggregated
 * multi-chain indexed backend.
 * @returns
 */
const getConfiguredChainId = () => {
    const NEXT_PUBLIC_CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;
    const chainId = NEXT_PUBLIC_CHAIN_ID || "31337";
    if (isNilOrEmpty(NEXT_PUBLIC_CHAIN_ID)) {
        console.warn(
            `NEXT_PUBLIC_CHAIN_ID is not defined. ${foundry.id} will be used  instead.`,
        );
    }

    return chainId;
};

export default getConfiguredChainId;
