import { isNotNilOrEmpty } from "ramda-adjunct";
import { createClient, http, type HttpTransportConfig } from "viem";
import { type SupportedChain } from "./supportedChains";

/**
 * Returns a viem http client using the default chain http rpc or the one set on
 * nodeRpcUrl parameter.
 * @param {SupportedChain} chain
 * @returns
 */
const createClientFor = (
    chain: SupportedChain,
    nodeRpcUrl?: string,
    transportOpts?: HttpTransportConfig,
) => {
    console.info(`Creating client transport for: ${chain.id} (${chain.name})`);

    const [defaultRpcUrl] = chain.rpcUrls.default.http;
    const transport = isNotNilOrEmpty(nodeRpcUrl)
        ? http(nodeRpcUrl, transportOpts)
        : http(defaultRpcUrl, transportOpts);

    return createClient({ chain, transport });
};

export default createClientFor;
