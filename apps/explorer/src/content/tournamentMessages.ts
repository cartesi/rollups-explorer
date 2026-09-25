/**
 * Content/copy for tournament related messages.
 */
export const tournamentMessages = {
    cycleRangeTxt: "Cycle range",
    leafSizeTxt: "Leaf size",
    spanTxt: "Span",
    cycle: {
        inputTxt: "Input",
        mcycleTxt: "mcycle",
        ucycleTxt: "ucycle",
        wholeEpochTxt: "whole epoch",
        wholeInputTxt: "whole input slot",
        metaCyclesTxt: "meta-cycles",
        unit: {
            input: "input slot",
            inputs: "input slots",
            mcycle: "mcycle",
            mcycles: "mcycles",
            ucycle: "ucycle",
            ucycles: "ucycles",
        },
        rangeHint:
            "Positions on the epoch's meta-cycle grid: the input, the machine cycle within that input and the uarch cycle within that machine cycle. The state at the start is agreed and the range runs up to its end, inclusive. It is a position, not the amount of work the machine did.",
    },
    bondEventsTxt: "Bond events",
    standingTxt: "Standing",
    winnerTxt: "Winner",
    finalStateTxt: "Final state",
    candidateTxt: "candidate",
    noWinnerTxt: "No winner",
    asOfBlockTxt: "as of block",
    expiresAtBlockTxt: "expires at block",
    standing: {
        MATCHES_ACTIVE: "matches active",
        AWAITING_CLOSURE: "awaiting closure",
        ROOT_WINNER: "winner",
        ROOT_FAILED: "no winner",
        INNER_WINNER: "provisional winner",
        INNER_ELIMINABLE_NO_WINNER: "no winner",
        INNER_ELIMINABLE_WINNER_EXPIRED: "winner expired",
    },
    standingHint: {
        ROOT_FAILED:
            "The root tournament finished without a winner. It does not prove that any commitment was wrong.",
        INNER_WINNER:
            "An inner winner is provisional until the parent match uses it before it expires.",
        INNER_ELIMINABLE_WINNER_EXPIRED:
            "The inner winner expired before the parent match used it, so it is no longer a winner.",
    },
} as const;
