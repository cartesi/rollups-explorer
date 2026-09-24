import type { Hash } from "viem";

export interface Claim {
    hash: Hash;
    parentClaims?: Hash[];
}

export type Cycle = bigint;
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
    {
        value: "decoded",
        label: "Decoded",
    },
] as const;

export type DecoderType = (typeof contentDisplayOptions)[number]["value"];
