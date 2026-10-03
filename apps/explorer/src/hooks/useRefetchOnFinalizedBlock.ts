"use client";
import { useEffect, useRef } from "react";
import { useBlock } from "wagmi";

/**
 * Call the given refetch functions every time a new finalized block is
 * observed. The node publishes tournament observations at its configured
 * block policy (finalized by default), so newer blocks carry no new data.
 * @param enabled whether to watch finalized blocks.
 * @param refetches functions to call on each new finalized block.
 */
export const useRefetchOnFinalizedBlock = (
    enabled: boolean,
    refetches: (() => unknown)[],
) => {
    const { data: block } = useBlock({
        blockTag: "finalized",
        watch: enabled,
        query: { enabled },
    });
    const blockNumber = block?.number ?? undefined;
    const refetchesRef = useRef(refetches);
    const lastBlockRef = useRef<bigint | undefined>(undefined);

    useEffect(() => {
        refetchesRef.current = refetches;
    });

    useEffect(() => {
        if (!enabled || blockNumber === undefined) return;
        const lastBlock = lastBlockRef.current;
        lastBlockRef.current = blockNumber;
        if (lastBlock !== undefined && lastBlock !== blockNumber) {
            refetchesRef.current.forEach((refetch) => refetch());
        }
    }, [blockNumber, enabled]);
};
