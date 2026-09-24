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
    summaryCardTxt: "Bond events",
    page: {
        titleTxt: "Bonds",
        epochTxt: "Epoch",
        allEpochsTxt: "All epochs",
        limitTxt: "Events per page",
        accountsTxt: "Accounts",
        eventsTxt: "Events",
        loadingTxt: "Loading bond events...",
        loadingTotalsTxt: "Loading totals...",
        selectEpochHint: "Select an epoch to see its totals by account.",
        errorTxt:
            "Something went wrong while fetching the bond events for application",
    },
    accounts: {
        columns: {
            accountTxt: "Account",
            eventsTxt: "Events",
            gasRefundedTxt: "Gas refunded",
            notPaidTxt: "Not paid",
            recoveredTxt: "Recovered",
            burnedTxt: "Burned",
        },
    },
    ledger: {
        noEventsTxt: "No bond events",
        recoveryTxt: "recovery",
        gasRefundTxt: "gas refund",
        gasRefundNotPaidTxt: "gas refund not paid",
        paidTxt: "paid",
        burnedTxt: "burned",
        totals: {
            gasRefundedTxt: "gas refunded",
            notPaidTxt: "not paid",
            paidTxt: "paid",
            burnedTxt: "burned",
        },
        columns: {
            blockTxt: "Block",
            tournamentTxt: "Tournament",
            typeTxt: "Type",
            accountTxt: "Account",
            valueTxt: "Value",
            transactionTxt: "Transaction",
        },
    },
    event: {
        titleTxt: "Bond event",
        typeTxt: "Type",
        tournamentTxt: "Tournament",
        epochTxt: "Epoch #",
        blockTxt: "Block",
        transactionTxt: "Transaction",
        logIndexTxt: "Log index",
        commitmentTxt: "Commitment",
        claimerTxt: "Claimer",
        paidTxt: "Paid",
        burnedTxt: "Burned",
        recipientTxt: "Recipient",
        refundedTxt: "Refunded",
        requestedTxt: "Requested",
        bondRecoveredTxt: "bond recovered",
        gasRefundTxt: "gas refund",
        gasRefundNotPaidTxt: "gas refund not paid",
    },
    dispositionHint: {
        NO_WINNER:
            "The tournament finished without a winner. Its balance stays locked in the contract; it is not burned.",
    },
} as const;
