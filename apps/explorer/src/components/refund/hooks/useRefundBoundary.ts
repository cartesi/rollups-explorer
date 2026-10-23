"use client";
import { useEpochs } from "@cartesi/react";
import { isNotNil } from "ramda";
import type { Address } from "viem";

interface Options {
    enabled?: boolean;
}

/**
 * Where refunds start for a foreclosed application: the epoch and the input
 * right after its last accepted epoch. Both are `0n` when no epoch was
 * accepted and `undefined` until known.
 */
export const useRefundBoundary = (
    application: Address | undefined,
    { enabled = true }: Options = {},
) => {
    const query = useEpochs({
        application,
        status: ["CLAIM_ACCEPTED"],
        descending: true,
        limit: 1,
        enabled: enabled && isNotNil(application),
    });
    const page = query.data?.data;
    const last = page?.[0];

    return {
        epochIndex: page ? (last ? last.index + 1n : 0n) : undefined,
        inputIndex: page ? (last ? last.inputIndexUpperBound : 0n) : undefined,
        isLoading: query.isLoading,
    };
};
