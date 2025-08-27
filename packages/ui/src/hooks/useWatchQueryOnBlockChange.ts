import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBlockNumber } from "wagmi";

export default function useWatchQueryOnBlockChange(
    queryKey: readonly unknown[],
) {
    const queryClient = useQueryClient();
    const { data: blockNumber } = useBlockNumber({ watch: true });
    const lastBlockNumber = useRef<bigint | undefined>(blockNumber);

    useEffect(() => {
        if (blockNumber !== lastBlockNumber.current) {
            lastBlockNumber.current = blockNumber;
            void queryClient.invalidateQueries({ queryKey });
        }
    }, [blockNumber, queryClient, queryKey]);
}
