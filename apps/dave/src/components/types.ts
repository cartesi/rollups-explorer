import type { Hash, Hex } from "viem";

export interface Claim {
    hash: Hash;
    parentClaims?: Hash[];
}

export type Cycle = number; // XXX: should be bigint, but leaving it as number for now for compatibility with storybook
export type CycleRange = [Cycle, Cycle];

type MatchAdvance = {
    type: "advance";
    direction: 0 | 1;
};

type MatchTimeout = {
    type: "timeout";
};

type MatchSubTournament = {
    type: "match_sealed_inner_tournament_created";
    range: CycleRange;
};

type MatchLeafSealed = {
    type: "leaf_match_sealed";
    winner: 1 | 2;
    proof: Hex;
};

type MatchEliminationTimeout = {
    type: "match_eliminated_by_timeout";
};

export type MatchAction = (
    | MatchAdvance
    | MatchTimeout
    | MatchSubTournament
    | MatchLeafSealed
    | MatchEliminationTimeout
) & { timestamp: number };

export interface Match {
    tournament?: Tournament;
    id: Hex;
    claim1: Claim;
    claim2: Claim;
    winner?: 1 | 2;
    timestamp: number; // instant in time when match was created
    winnerTimestamp?: number; // instant in time when match was resolved (winner declared)
    actions: MatchAction[];
}

export interface Tournament {
    id: Hex;
    height: number;
    level: "top" | "middle" | "bottom";
    startCycle: Cycle;
    endCycle: Cycle;
    matches: Match[];
    danglingClaim?: Claim; // claim that was not matched with another claim yet
    winner?: Claim;
}
