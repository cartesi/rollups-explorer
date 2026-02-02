import type { Hash } from "viem";

export interface Claim {
    hash: Hash;
    parentClaims?: Hash[];
}

export type Cycle = number; // XXX: should be bigint, but leaving it as number for now for compatibility with storybook
export type CycleRange = [Cycle, Cycle];

export const contentDisplayOptions = [
    {
        value: "raw",
        label: "Raw",
    },
    {
        value: "text",
        label: "As Text",
    },
    {
        value: "json",
        label: "as Json",
    },
] as const;

export type DecoderType = (typeof contentDisplayOptions)[number]["value"];
