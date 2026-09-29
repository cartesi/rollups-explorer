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
    gasRefund: {
        paidTxt: "gas refunded",
        requestedTxt: "gas refund requested",
        toTxt: "to",
        notPaidTxt: "not paid",
        notPaidHint:
            "The refund payment failed. The value was requested but never paid, and it stays in the tournament balance.",
        hint: "Paid from the tournament's pooled bonds to the account that sent the move (contract event PartialBondRefund). Capped, so it may not cover the full gas cost.",
    },
    dispositionHint: {
        NO_WINNER:
            "The tournament finished without a winner. Its balance stays locked in the contract; it is not burned.",
    },
} as const;
