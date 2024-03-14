import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBlockNumber } from "wagmi";

export default function useWatchQueryOnBlockChange(
    queryKey: readonly unknown[],
) {
    const queryClient = useQueryClient();
    const { data: blockNumber } = useBlockNumber({ watch: true });

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey });
    }, [blockNumber, queryClient, queryKey]);
}
