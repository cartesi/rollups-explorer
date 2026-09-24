/**
 * Content/copy for tournament bond related messages.
 */
export const bondMessages = {
    bondTxt: "Bond",
    claimerTxt: "Claimer",
    unclaimedPaymentTxt: "Unclaimed payment",
    paidTxt: "Paid",
    burnedTxt: "Burned",
    transactionTxt: "Transaction",
    disposition: {
        NO_WINNER: "no winner",
        RECOVERABLE: "recoverable",
        RECOVERED: "recovered",
    },
    dispositionHint: {
        NO_WINNER:
            "The tournament finished without a winner. Its balance stays locked in the contract; it is not burned.",
    },
} as const;
