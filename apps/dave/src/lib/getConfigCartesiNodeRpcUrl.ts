/**
 * Return the configured CARTESI-NODE-RPC-URL (e.g. http://127.0.0.1:10011/rpc)
 * It is meant to be used with server-side capability to provide dinamyc configuration capability for multiple
 * running web applications in the same host.
 */
export const getConfiguredCartesiNodeRpcUrl = () => {
    const cartesiNodeRpcUrl =
        process.env.CARTESI_NODE_RPC_URL ||
        process.env.NEXT_PUBLIC_CARTESI_NODE_RPC_URL;

    return cartesiNodeRpcUrl;
};
