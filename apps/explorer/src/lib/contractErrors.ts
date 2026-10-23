import {
    BaseError,
    ContractFunctionRevertedError,
    UserRejectedRequestError,
} from "viem";

/**
 * Find the revert error inside a viem error chain.
 *
 * @param error Error thrown by a contract simulation or write
 * @returns The revert error, or `undefined` when the call did not revert
 */
const findRevert = (
    error: unknown,
): ContractFunctionRevertedError | undefined => {
    if (!(error instanceof BaseError)) return undefined;
    const revert = error.walk(
        (e) => e instanceof ContractFunctionRevertedError,
    );
    return revert instanceof ContractFunctionRevertedError ? revert : undefined;
};

/**
 * Name of the custom error a contract reverted with, when the revert data
 * matches an error of the ABI the call was made with.
 *
 * @param error Error thrown by a contract simulation or write
 */
export const getRevertErrorName = (error: unknown): string | undefined =>
    findRevert(error)?.data?.errorName;

/**
 * Reason string of a revert, such as the message of a `require` in a token
 * contract bubbled up through the call.
 *
 * @param error Error thrown by a contract simulation or write
 */
export const getRevertReason = (error: unknown): string | undefined =>
    findRevert(error)?.reason;

/**
 * Whether the user rejected the transaction in the wallet, which is not a
 * failure of the call itself.
 *
 * @param error Error thrown by a contract write
 */
export const isUserRejection = (error: unknown): boolean =>
    error instanceof BaseError &&
    error.walk((e) => e instanceof UserRejectedRequestError) !== null;
