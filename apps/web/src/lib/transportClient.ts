import { isNotNilOrEmpty } from "ramda-adjunct";
import { createClient, http } from "viem";
import { SupportedChain } from "./supportedChains";

/**
 * Returns a viem http client using the default chain http rpc or the one set on
 * nodeRpcUrl parameter.
 * @param {SupportedChain} chain
 * @returns
 */
const createClientFor = (chain: SupportedChain, nodeRpcUrl?: string) => {
    console.info(`Creating client transport for: ${chain.id} (${chain.name})`);

    const [defaultRpcUrl] = chain.rpcUrls.default.http;
    const transport = isNotNilOrEmpty(nodeRpcUrl)
        ? http(nodeRpcUrl)
        : http(defaultRpcUrl);

    return createClient({ chain, transport });
};

export default createClientFor;
