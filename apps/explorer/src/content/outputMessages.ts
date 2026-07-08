/**
 * This file contains the output messages used in the application.
 */
export const outputMessages = {
    txhash: "Execution transaction hash",
    delegateCallVoucherTxt: "Delegated Call Voucher",
    voucherTxt: "Voucher",
    noticeTxt: "Notice",
    voucher: {
        checking: "Checking voucher...",
        preparing: "Preparing voucher...",
        executed: "Executed",
        execute: "Execute",
        executionSuccess: "Voucher executed successfully!",
        feedback: {
            executionStatusTxt: "Voucher execution status",
            executionStatusSuccess: "Executed successfully",
            executionStatusError: "Execution failed",
        },
    },
    epoch: {
        nonAcceptedClaim:
            "Once the epoch status become CLAIM_ACCEPTED the output will become executable.",
        claimForeclosed:
            "The epoch claim is foreclosed. The output cannot be executed.",
        waitingClaim: "Waiting for claim.",
        executionForeclosed: "Execution foreclosed.",
    },
} as const;
