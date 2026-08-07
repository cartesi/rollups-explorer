/**
 * This file contains the withdrawal messages used in the application.
 */
export const withdrawalMessages = {
    txHash: "Withdrawal transaction hash",
    accountIndex: "Account index",
    account: "Withdrawal account",
    output: "Withdrawal output",
    accountsDrive: {
        notProved:
            "The application accounts drive is not proved yet. Withdrawals cannot be requested.",
        proved: "The application accounts drive is proved. Withdrawals can be processed.",
    },
    error: {
        decode: {
            destination:
                "Unable to decode the payload data against the destination contract ABI.",
        },
        output: {
            nonExecutable: "Non-executable output type.",
        },
    },
} as const;
