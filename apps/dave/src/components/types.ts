import type { Hash } from "viem";

export interface Claim {
    hash: Hash;
    parentClaims?: Hash[];
}

export type Cycle = number; // XXX: should be bigint, but leaving it as number for now for compatibility with storybook
export type CycleRange = [Cycle, Cycle];
