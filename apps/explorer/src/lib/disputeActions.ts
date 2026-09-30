import type { Commitment, CommitmentSide, Match } from "@cartesi/client";

export type MatchTimeoutAction =
    | { kind: "win"; side: CommitmentSide }
    | { kind: "eliminate" };

/**
 * The timeout call the match allows as of its snapshot: a win for the side
 * that still has time, or eliminating both when neither does.
 */
export const getMatchTimeoutAction = (
    match: Match,
): MatchTimeoutAction | null => {
    if (match.deletionReason !== "NOT_DELETED") return null;
    switch (match.snapshot.timeoutOutcome) {
        case "ONE_WINS":
            return { kind: "win", side: "ONE" };
        case "TWO_WINS":
            return { kind: "win", side: "TWO" };
        case "ELIMINATE_BOTH":
            return { kind: "eliminate" };
        default:
            return null;
    }
};

/**
 * Blocks left before a timeout win turns into eliminating both. A paused
 * survivor keeps its allowance while the deferred charge grows each block; a
 * running survivor, in a sealed leaf race, spends its own clock instead.
 * @returns the blocks left, or `undefined` without the survivor's clock.
 */
export const getTimeoutWinExpiry = (
    match: Match,
    survivor?: Commitment,
): bigint | undefined => {
    if (!survivor) return undefined;
    const { clockRunning, clockDeadline, clockAllowance, asOfBlock } =
        survivor.snapshot;
    const left = clockRunning
        ? clockDeadline - asOfBlock
        : clockAllowance - match.snapshot.deferredCharge;
    return left > 0n ? left : undefined;
};
