import type { Application } from "@cartesi/viem";
import { isNil } from "ramda";
import { isAddressEqual, zeroHash, type Address, type Hash } from "viem";

/**
 *
 * Check if the application is foreclosed.
 * See JSON-RPC Discover reference {@link https://github.com/cartesi/rollups-node/blob/v2.0.0-alpha.12/internal/jsonrpc/jsonrpc-discover.json#L1443}
 *
 * @param application {Application} - The application object to check for foreclosure status.
 * @returns {boolean} - Returns true if the application is foreclosed, otherwise false.
 */
export const isForeclosed = (application: Application) => {
    return (
        application.forecloseBlock !== 0n &&
        hasForecloseTransaction(application.forecloseTransaction)
    );
};

const hasForecloseTransaction = (hash: Hash | null | undefined) => {
    if (isNil(hash) || hash === zeroHash) {
        return false;
    }
    return true;
};

/**
 * Check if the given address is the guardian configured in the withdrawal setup of the application.
 * @param application The application object containing the withdrawal configuration.
 * @param address  The address to check against the guardian address in the application's withdrawal configuration.
 * @returns {boolean} - Returns true if the address is the guardian, otherwise false.
 */
export const isGuardian = (application: Application, address?: Address) => {
    if (!address || !application) return false;

    if (
        isNil(application.withdrawalConfig) ||
        isNil(application.withdrawalConfig.guardian)
    ) {
        return false;
    }

    const guardian = application.withdrawalConfig.guardian;

    return isAddressEqual(address, guardian);
};
