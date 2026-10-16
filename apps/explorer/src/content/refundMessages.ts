export const refundMessages = {
    summaryCardTxt: "Refunds",
    refundTxt: "Refund deposit",
    refundableTxt: "Refundable",
    refundingTxt: "Waiting for confirmation…",
    refundedTxt: "Deposit refunded",
    successTxt: "Refund confirmed.",
    failedTxt: "The refund could not be sent.",
    tokenRevertedTxt: "The token contract rejected the transfer:",
    /** Copy for the custom errors `issueRefund` can revert with, keyed by error name. */
    errors: {
        RefundAlreadyIssued: "A refund was already issued for this deposit.",
        CannotRefundFinalizedInput:
            "The application processed this deposit, so it cannot be refunded.",
        InsufficientFunds:
            "The application no longer holds enough Ether to pay this refund.",
    },
    checkingTxt: "Checking refund status…",
    hint: "Anyone can issue a refund. The smart contract pays the original depositor. The caller only pays gas.",
    previewTxt: "Refund",
    unitsTxt: "units of",
    tokenIdTxt: "#",
    tokenIdsTxt: "token ids of",
    summary: {
        titleTxt: "Refundable deposits",
        columns: {
            inputTxt: "Input",
            assetTxt: "Asset",
            depositorTxt: "Depositor",
            epochTxt: "Epoch",
            statusTxt: "Status",
        },
    },
} as const;
