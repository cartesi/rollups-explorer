import type {
    CommitmentSide,
    Match,
    MatchAdvanced,
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
 * commitment tree and each following one the segment left by an advance.
 */
export const getAdvanceRanges = (
    tournament: Tournament,
    advances: MatchAdvanced[],
): [bigint, bigint][] => [
    [0n, 1n << tournament.height],
    ...advances.map((advance, index): [bigint, bigint] => [
        advance.segmentStartPosition,
        advance.segmentStartPosition +
            (1n << (tournament.height - BigInt(index) - 1n)),
    ]),
];

/**
 * Percentage of the bisection already done. A deleted match carries no phase
 * payload, so its progress comes from the recorded advances.
 */
export const getMatchProgress = (
    match: Match,
    tournament: Tournament,
    advancesCount: number,
) => {
    const total = Number(tournament.height - 1n);
    if (total <= 0) return 100;
    switch (match.snapshot.phase) {
        case "BISECTING":
            return (
                (Number(
                    tournament.height - match.snapshot.bisection.currentHeight,
                ) /
                    total) *
                100
            );
        case "READY_TO_SEAL":
        case "SEALED":
            return 100;
        case "UNINITIALIZED":
            return Math.min(advancesCount / total, 1) * 100;
    }
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

export const getResponder = (match: Match): CommitmentSide | null =>
    match.snapshot.phase === "BISECTING" ||
    match.snapshot.phase === "READY_TO_SEAL"
        ? match.snapshot.bisection.responder
        : null;

export const getBlocksLeft = (deadline: bigint, asOfBlock: bigint) =>
    deadline > asOfBlock ? deadline - asOfBlock : 0n;
