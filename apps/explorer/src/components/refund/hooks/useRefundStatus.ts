"use client";
import {
    iApplicationAbi,
    useReadIApplicationWasRefundForInputIssued,
} from "@cartesi/react";
import { isNil, isNotNil } from "ramda";
import { useMemo } from "react";
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

/** Refund flags of several inputs in one batched read; `byIndex` holds the reads that succeeded and `failed` the indices with no value, cached or fresh. */
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

    const data = query.data;
    const byIndex = useMemo(
        () =>
            new Map<bigint, boolean>(
                inputIndices.flatMap((inputIndex, i) => {
                    const result = data?.[i];
                    return result?.status === "success"
                        ? [[inputIndex, result.result as boolean] as const]
                        : [];
                }),
            ),
        [inputIndices, data],
    );

    const isError = query.isError;
    const failed = useMemo(
        () =>
            new Set(
                inputIndices.filter(
                    (_, i) =>
                        (isError && isNil(data)) ||
                        data?.[i]?.status === "failure",
                ),
            ),
        [inputIndices, data, isError],
    );

    return {
        byIndex,
        failed,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
};
