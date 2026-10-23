"use client";
import {
    iApplicationAbi,
    useReadIApplicationWasRefundForInputIssued,
} from "@cartesi/react";
import { isNotNil } from "ramda";
import type { Address } from "viem";
import { useReadContracts } from "wagmi";

interface Options {
    enabled?: boolean;
}

/** Whether the deposit was already refunded, read on chain: the node does not index refunds. Not polled. */
export const useRefundStatus = (
    application: Address | undefined,
    inputIndex: bigint | undefined,
    { enabled = true }: Options = {},
) => {
    const query = useReadIApplicationWasRefundForInputIssued({
        address: application,
        args: isNotNil(inputIndex) ? [inputIndex] : undefined,
        query: {
            enabled: enabled && isNotNil(application) && isNotNil(inputIndex),
        },
    });

    return {
        refundIssued: query.data,
        isLoading: query.isLoading,
        isFetching: query.isFetching,
        error: query.error,
        refetch: query.refetch,
    };
};

/** Refund flags of several inputs in one batched read; `byIndex` holds the reads that succeeded and `failed` the indices of those that did not. */
export const useRefundStatuses = (
    application: Address | undefined,
    inputIndices: bigint[],
    { enabled = true }: Options = {},
) => {
    const query = useReadContracts({
        contracts: inputIndices.map((inputIndex) => ({
            abi: iApplicationAbi,
            address: application,
            functionName: "wasRefundForInputIssued",
            args: [inputIndex],
        })),
        allowFailure: true,
        query: {
            enabled:
                enabled && isNotNil(application) && inputIndices.length > 0,
        },
    });

    const byIndex = new Map<bigint, boolean>(
        inputIndices.flatMap((inputIndex, i) => {
            const result = query.data?.[i];
            return result?.status === "success"
                ? [[inputIndex, result.result as boolean] as const]
                : [];
        }),
    );

    const failed = new Set(
        inputIndices.filter(
            (_, i) => query.isError || query.data?.[i]?.status === "failure",
        ),
    );

    return {
        byIndex,
        failed,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
};
