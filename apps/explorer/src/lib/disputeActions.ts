import type {
    Commitment,
    CommitmentSide,
    Match,
    Tournament,
} from "@cartesi/client";
import type { Hash } from "viem";

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

export type InnerTournamentAction =
    | { kind: "win"; parentCommitment: Hash }
    | { kind: "eliminate" };

/**
 * The call the parent tournament accepts for a finished inner tournament:
 * propagating a live winner, or closing the parent match when the inner
 * tournament has no winner or its winner expired.
 * @param parentMatch the sealed parent match; `null` or `undefined` while
 * unknown, which offers nothing.
 */
export const getInnerTournamentAction = (
    child: Tournament,
    parentMatch?: Match | null,
): InnerTournamentAction | null => {
    const { innerResult, asOfBlock, winnerExpiresAt } = child.snapshot;
    if (
        !child.parentTournamentAddress ||
        !innerResult ||
        !parentMatch ||
        parentMatch.deletionReason !== "NOT_DELETED"
    ) {
        return null;
    }
    if (
        innerResult.disposition === "WINNER" &&
        innerResult.parentCommitment &&
        asOfBlock < winnerExpiresAt
    ) {
        return { kind: "win", parentCommitment: innerResult.parentCommitment };
    }
    return innerResult.disposition === "ELIMINABLE"
        ? { kind: "eliminate" }
        : null;
};

/**
 * Blocks left to propagate an inner winner before it expires.
 */
export const getInnerWinExpiry = (child: Tournament): bigint | undefined => {
    const { asOfBlock, winnerExpiresAt } = child.snapshot;
    return winnerExpiresAt > asOfBlock
        ? winnerExpiresAt - asOfBlock
        : undefined;
};
