import type {
    CommitmentSide,
    Match,
    MatchAdvanced,
    MatchSealedSnapshot,
    Tournament,
    TournamentSnapshot,
    TournamentStandingState,
} from "@cartesi/client";
import type { Hash } from "viem";

export type TournamentOutcome =
    | { status: "pending"; candidate: Hash | null }
    | { status: "winner"; commitment: Hash; finalStateHash: Hash | null }
    | {
          status: "provisional";
          commitment: Hash;
          finalStateHash: Hash | null;
          expiresAt: bigint;
      }
    | { status: "expired"; candidate: Hash | null }
    | { status: "noWinner" };

/**
 * Read the tournament result from its current standing. An inner winner is
 * provisional until it is consumed by the parent match, and an expired inner
 * candidate is never a winner.
 */
export const getTournamentOutcome = (
    snapshot: TournamentSnapshot,
): TournamentOutcome => {
    const commitment = snapshot.winnerCommitment ?? snapshot.candidate;
    const { finalStateHash } = snapshot;

    switch (snapshot.standing) {
        case "ROOT_WINNER":
            return commitment
                ? { status: "winner", commitment, finalStateHash }
                : { status: "pending", candidate: null };
        case "INNER_WINNER":
            return commitment
                ? {
                      status: "provisional",
                      commitment,
                      finalStateHash,
                      expiresAt: snapshot.winnerExpiresAt,
                  }
                : { status: "pending", candidate: null };
        case "INNER_ELIMINABLE_WINNER_EXPIRED":
            return { status: "expired", candidate: snapshot.candidate };
        case "ROOT_FAILED":
        case "INNER_ELIMINABLE_NO_WINNER":
            return { status: "noWinner" };
        case "MATCHES_ACTIVE":
        case "AWAITING_CLOSURE":
            return { status: "pending", candidate: snapshot.candidate };
    }
};

const settledStandings = new Set<TournamentStandingState>([
    "ROOT_WINNER",
    "ROOT_FAILED",
    "INNER_ELIMINABLE_NO_WINNER",
    "INNER_ELIMINABLE_WINNER_EXPIRED",
]);

/**
 * Whether the tournament snapshot can no longer change: a terminal standing
 * already observed and no bond left to recover.
 */
export const isTournamentSettled = ({ snapshot }: Tournament) =>
    settledStandings.has(snapshot.standing) &&
    snapshot.finishedAtBlock !== 0n &&
    snapshot.finishedAtBlock <= snapshot.asOfBlock &&
    (snapshot.bondRecovery.disposition === "NO_WINNER" ||
        snapshot.bondRecovery.disposition === "RECOVERED");

export const toCycle = (tournament: Tournament, leafPosition: bigint) =>
    tournament.baseCycle + (leafPosition << tournament.log2step);

export const getTournamentCycleRange = (
    tournament: Tournament,
): [bigint, bigint] => [
    tournament.baseCycle,
    toCycle(tournament, 1n << tournament.height),
];

/**
 * Leaf ranges of the divergence frontier, the first one being the whole
 * commitment tree and each following one the segment left by an advance, as
 * wide as the height the advance reported.
 */
export const getAdvanceRanges = (
    tournament: Tournament,
    advances: MatchAdvanced[],
): [bigint, bigint][] => [
    [0n, 1n << tournament.height],
    ...advances.map((advance): [bigint, bigint] => [
        advance.segmentStartPosition,
        advance.segmentStartPosition + (1n << advance.currentHeight),
    ]),
];

/**
 * Height of the segment a match still disputes: from the snapshot while it is
 * open, and from the last recorded advance once it is deleted, since a deleted
 * match carries no phase payload.
 */
export const getCurrentHeight = (
    match: Match,
    tournament: Tournament,
    advances: MatchAdvanced[],
): bigint => {
    switch (match.snapshot.phase) {
        case "BISECTING":
            return match.snapshot.bisection.currentHeight;
        case "READY_TO_SEAL":
            return 1n;
        case "SEALED":
            return 0n;
        case "UNINITIALIZED":
            return advances.at(-1)?.currentHeight ?? tournament.height;
    }
};

/**
 * Percentage of the bisection already done.
 */
export const getMatchProgress = (
    match: Match,
    tournament: Tournament,
    advances: MatchAdvanced[],
) => {
    const total = Number(tournament.height - 1n);
    if (total <= 0) return 100;
    const done = Number(
        tournament.height - getCurrentHeight(match, tournament, advances),
    );
    return Math.min(done / total, 1) * 100;
};

/**
 * Commitment one reveals first and every advance swaps the revealer.
 */
export const getAdvanceSide = (index: number): CommitmentSide =>
    index % 2 === 0 ? "ONE" : "TWO";

export const getCommitment = (match: Match, side: CommitmentSide) =>
    side === "ONE" ? match.commitmentOne : match.commitmentTwo;

export const getWinner = (match: Match) =>
    match.winnerCommitment === "NONE"
        ? null
        : getCommitment(match, match.winnerCommitment);

export const getLoser = (match: Match) =>
    match.winnerCommitment === "NONE"
        ? null
        : getCommitment(
              match,
              match.winnerCommitment === "ONE" ? "TWO" : "ONE",
          );

/**
 * The block a match was deleted in, `undefined` while it is open: the record
 * carries zero until then, which is not a block to look up.
 */
export const getDeletionBlock = (match: Match): bigint | undefined =>
    match.deletionReason === "NOT_DELETED"
        ? undefined
        : match.deletionBlockNumber;

export const getResponder = (match: Match): CommitmentSide | null =>
    match.snapshot.phase === "BISECTING" ||
    match.snapshot.phase === "READY_TO_SEAL"
        ? match.snapshot.bisection.responder
        : null;

export const getBlocksLeft = (deadline: bigint, asOfBlock: bigint) =>
    deadline > asOfBlock ? deadline - asOfBlock : 0n;

/**
 * Dave meta-cycle layout: a 92-bit position made of the input index (24 bits),
 * the big-machine cycle within that input (48 bits) and the uarch cycle within
 * that big cycle (20 bits).
 */
export const LOG2_UCYCLES_PER_MCYCLE = 20n;
export const LOG2_MCYCLES_PER_INPUT = 48n;
export const LOG2_INPUTS_PER_EPOCH = 24n;

const LOG2_UCYCLES_PER_INPUT = LOG2_MCYCLES_PER_INPUT + LOG2_UCYCLES_PER_MCYCLE;

export const UCYCLE_MASK = (1n << LOG2_UCYCLES_PER_MCYCLE) - 1n;
export const MCYCLE_MASK = (1n << LOG2_MCYCLES_PER_INPUT) - 1n;
export const LAST_INPUT = (1n << LOG2_INPUTS_PER_EPOCH) - 1n;

export type MetaCycleParts = { input: bigint; mcycle: bigint; ucycle: bigint };

export const decomposeMetaCycle = (metaCycle: bigint): MetaCycleParts => ({
    input: metaCycle >> LOG2_UCYCLES_PER_INPUT,
    mcycle: (metaCycle >> LOG2_UCYCLES_PER_MCYCLE) & MCYCLE_MASK,
    ucycle: metaCycle & UCYCLE_MASK,
});

export type MetaSpan = { count: bigint; unit: "input" | "mcycle" | "ucycle" };

/**
 * Express a span of `2^log2` meta-cycles in its largest whole unit.
 */
export const getMetaSpan = (log2: bigint): MetaSpan => {
    if (log2 >= LOG2_UCYCLES_PER_INPUT) {
        return { count: 1n << (log2 - LOG2_UCYCLES_PER_INPUT), unit: "input" };
    }
    if (log2 >= LOG2_UCYCLES_PER_MCYCLE) {
        return {
            count: 1n << (log2 - LOG2_UCYCLES_PER_MCYCLE),
            unit: "mcycle",
        };
    }
    return { count: 1n << log2, unit: "ucycle" };
};

/**
 * Meta-cycle range of the current divergence segment of a match, or null when
 * the match has no bisection frontier.
 */
export type TournamentLabel = "root" | "inner" | "leaf";

/**
 * How the protocol names a tournament: the root at level 0, a leaf by kind,
 * and inner for the levels between, whatever the table's level count.
 */
export const getTournamentLabel = (
    tournament: Pick<Tournament, "level" | "kind">,
): TournamentLabel =>
    tournament.level === 0n
        ? "root"
        : tournament.kind === "LEAF"
          ? "leaf"
          : "inner";

/**
 * The parent side a final state defends, as the contract maps it: the side
 * whose contested final state it equals. Nothing for a root tournament.
 */
export const getDefendedSide = (
    tournament: Pick<
        Tournament,
        "contestedFinalStateOne" | "contestedFinalStateTwo"
    >,
    finalStateHash: Hash | null,
): CommitmentSide | null => {
    if (!finalStateHash) return null;
    if (finalStateHash === tournament.contestedFinalStateOne) return "ONE";
    if (finalStateHash === tournament.contestedFinalStateTwo) return "TWO";
    return null;
};

/**
 * The sealed values of a match: its snapshot while sealed, otherwise the
 * durable leaf seal, whose cycle is derived the way the contract does.
 */
export const getSealedState = (
    match: Match,
    tournament: Tournament,
): MatchSealedSnapshot | null => {
    if (match.snapshot.phase === "SEALED") return match.snapshot.sealed;
    if (!match.leafSeal) return null;
    const { agreeState, divergencePosition, finalStateOne, finalStateTwo } =
        match.leafSeal;
    return {
        agreeState,
        divergencePosition,
        divergenceCycle: toCycle(tournament, divergencePosition),
        finalStateOne,
        finalStateTwo,
    };
};

export const getSegmentRange = (
    match: Match,
    tournament: Tournament,
): [bigint, bigint] | null => {
    const { snapshot } = match;
    if (snapshot.phase !== "BISECTING" && snapshot.phase !== "READY_TO_SEAL") {
        return null;
    }
    const height = snapshot.bisection.currentHeight ?? 1n;
    const start = snapshot.bisection.segmentStartCycle;
    return [start, start + (1n << (tournament.log2step + height))];
};
