import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBlockNumber } from "wagmi";
import { isEqual } from "../utils";

export default function useWatchQueryOnBlockChange(
    queryKey: readonly unknown[],
) {
    const queryClient = useQueryClient();
    const { data: blockNumber } = useBlockNumber({ watch: true });
    const lastQueryKey = useRef<readonly unknown[] | null>(null);
    const lastBlockNumber = useRef<bigint | undefined>(undefined);

    useEffect(() => {
        if (
            !isEqual(queryKey, lastQueryKey.current) ||
            blockNumber !== lastBlockNumber.current
        ) {
            lastQueryKey.current = queryKey;
            lastBlockNumber.current = blockNumber;
            void queryClient.invalidateQueries({ queryKey });
        }
    }, [blockNumber, queryClient, queryKey]);
}
