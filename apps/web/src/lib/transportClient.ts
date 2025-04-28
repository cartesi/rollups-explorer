import { isNotNilOrEmpty } from "ramda-adjunct";
import { createClient, http } from "viem";
import { SupportedChain } from "./supportedChains";

const NODE_RPC_URL = process.env.NEXT_PUBLIC_NODE_RPC_URL;

/**
 * Returns a viem http client using the default chain http rpc or the one set on
 * NEXT_PUBLIC_NODE_RPC_URL environment variable.
 * @param {SupportedChain} chain
 * @returns
 */
const createClientFor = (chain: SupportedChain) => {
    console.info(`Creating client transport for: ${chain.id} (${chain.name})`);
    const [defaultRpcUrl] = chain.rpcUrls.default.http;
    const transport = isNotNilOrEmpty(NODE_RPC_URL)
        ? http(NODE_RPC_URL)
        : http(defaultRpcUrl);

    return createClient({ chain, transport });
};

export default createClientFor;
