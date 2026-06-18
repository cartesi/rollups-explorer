import type { Application } from "@cartesi/viem";
import { zeroHash, type Hash } from "viem";

/**
 *
 * Check if the application is foreclosed.
 * See JSON-RPC Discover reference {@link https://github.com/cartesi/rollups-node/blob/v2.0.0-alpha.12/internal/jsonrpc/jsonrpc-discover.json#L1443}
 *
 * @param application {Application} - The application object to check for foreclosure status.
 * @returns
 */
export const isForeclosed = (application: Application) => {
    return (
        application.forecloseBlock !== 0n &&
        hasForecloseTransaction(application.forecloseTransaction)
    );
};

const hasForecloseTransaction = (hash: Hash | null | undefined) => {
    if (hash === null || hash === zeroHash) {
        return false;
    }
    return true;
};
