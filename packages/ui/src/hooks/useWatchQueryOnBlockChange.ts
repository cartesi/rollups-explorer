import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBlockNumber, useBalance } from "wagmi";

export default function useWatchQuery() {
    const { data: blockNumber } = useBlockNumber({ watch: true });

    useEffect(() => {
        queryClient.invalidateQueries({ queryKey });
    }, [blockNumber, queryClient]);
}
