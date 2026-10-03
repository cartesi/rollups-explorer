"use client";
import { useQueries } from "@tanstack/react-query";
import { isNotNil, uniq } from "ramda";
import { useConfig } from "wagmi";
import { getBlock } from "wagmi/actions";

/**
 * Resolve block numbers into their timestamps in milliseconds. Blocks are
 * immutable, so each one is fetched once.
 * @param blockNumbers block numbers to resolve, nullish entries are skipped.
 * @returns map from block number to timestamp, filled as blocks arrive, and
 * whether any block is still being fetched.
 */
export const useBlockTimestamps = (
    blockNumbers: (bigint | null | undefined)[],
) => {
    const config = useConfig();
    const chainId = config.state.chainId;
    const blocks = uniq(blockNumbers.filter(isNotNil));

    return useQueries({
        queries: blocks.map((blockNumber) => ({
            queryKey: ["blockTimestamp", chainId, blockNumber.toString()],
            queryFn: async () => {
                const block = await getBlock(config, { blockNumber });
                return Number(block.timestamp) * 1000;
            },
            staleTime: Infinity,
            retry: 1,
        })),
        combine: (results) => ({
            timestamps: new Map(
                blocks.flatMap((blockNumber, index) => {
                    const timestamp = results[index].data;
                    return timestamp === undefined
                        ? []
                        : [[blockNumber, timestamp] as const];
                }),
            ),
            isLoading: results.some((result) => result.isPending),
        }),
    });
};
