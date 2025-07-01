/**
 * Return the configured NODE-RPC-URL (e.g. alchemy / infura endpoints)
 * It is meant to be used with server-side capability to provide dinamyc configuration capability for multiple
 * running explorers in the same host.
 */
export const getConfiguredNodeRpcUrl = () => {
    const nodeRpcUrl =
        process.env.NODE_RPC_URL || process.env.NEXT_PUBLIC_NODE_RPC_URL;

    return nodeRpcUrl;
};
