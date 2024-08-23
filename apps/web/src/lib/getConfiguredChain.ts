const chainId = process.env.NEXT_PUBLIC_CHAIN_ID;

/**
 * Simple function (not a hook) to be reused through out the app to share
 * the configured chain id. This will ease the transition to the aggregated
 * multi-chain indexed backend.
 * @returns
 */
const getConfiguredChainId = () => {
    if (!chainId) console.warn("NEXT_PUBLIC_CHAIN_ID is not defined");

    return chainId;
};

export default getConfiguredChainId;
