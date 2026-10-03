/**
 * Content/copy for tournament bond related messages.
 */
export const bondMessages = {
    bondTxt: "Bond",
    statusTxt: "Status",
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
    join: {
        columns: {
            claimTxt: "Claim",
            depositorTxt: "Depositor",
            amountTxt: "Amount",
            transactionTxt: "Transaction",
        },
        depositorHint:
            "Posted once by the depositor when the claim joined this tournament. Any account can send the moves and timeouts afterwards, and gas refunds go to whoever sent them, not to the depositor.",
        atLeastTxt: "at least",
        atLeastHint:
            "This join went through another contract, so its transaction doesn't show the exact amount. The contract requires at least the bond value.",
    },
    refundSender: {
        depositorTxt: "depositor",
        otherAccountTxt: "other account",
        otherAccountHint: "Sent by an account that didn't deposit either bond.",
    },
    pool: {
        bondValueTxt: "Bond value",
        bondValueHint:
            "The minimum each claim must post to join this tournament. Every tournament level sets its own.",
        perJoinTxt: "per join",
        depositedTxt: "Deposited",
        atLeastTxt: "at least",
        joinTxt: "join",
        joinsTxt: "joins",
        gasRefundedTxt: "Gas refunded",
        refundTxt: "refund",
        refundsTxt: "refunds",
        balanceTxt: "Balance",
        balanceHint:
            "What the tournament contract holds now. Unpaid refunds stay in it, and without a winner it stays locked.",
        splitTxt: "Where the bonds went",
        split: {
            balanceTxt: "Balance",
            refundedTxt: "Gas refunded",
            paidTxt: "Paid to winner",
            burnedTxt: "Burned",
        },
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
    recovery: {
        recoverTxt: "Recover bond",
        recoveredTxt: "Bond recovered",
        successTxt: "Bond recovery confirmed.",
        recoverHint:
            "Anyone can trigger the recovery. The contract pays the winning claimer, never the caller, who only pays the gas.",
    },
    dispositionHint: {
        NO_WINNER:
            "The tournament finished without a winner. Its balance stays locked in the contract; it is not burned.",
    },
} as const;
