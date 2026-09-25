/**
 * Content/copy for tournament related messages.
 */
export const tournamentMessages = {
    cycleRangeTxt: "Cycle range",
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
