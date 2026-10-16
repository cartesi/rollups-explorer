import {
    BaseError,
    ContractFunctionRevertedError,
    UserRejectedRequestError,
} from "viem";

const findRevert = (
    error: unknown,
): ContractFunctionRevertedError | undefined => {
    if (!(error instanceof BaseError)) return undefined;
    const revert = error.walk(
        (e) => e instanceof ContractFunctionRevertedError,
    );
    return revert instanceof ContractFunctionRevertedError ? revert : undefined;
};

/** Custom error name of a revert, when the revert data matches the ABI the call was made with. */
export const getRevertErrorName = (error: unknown): string | undefined =>
    findRevert(error)?.data?.errorName;

/** Reason string of a revert, such as a `require` message bubbled up from a token contract. */
export const getRevertReason = (error: unknown): string | undefined =>
    findRevert(error)?.reason;

/** Whether the user rejected the transaction in the wallet, anywhere in the error chain. */
export const isUserRejection = (error: unknown): boolean =>
    error instanceof BaseError &&
    error.walk((e) => e instanceof UserRejectedRequestError) !== null;
