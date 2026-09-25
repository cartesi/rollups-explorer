"use client";
import type { Match } from "@cartesi/client";
import { iTournamentAbi } from "@cartesi/client/abi";
import { useMemo } from "react";
import { decodeFunctionData, type Hex } from "viem";
import { useTransaction } from "wagmi";

/**
 * Read the state-transition proof of a match won by a leaf step, from the
 * `winLeafMatch` call that deleted it.
 * @returns the proof, `null` when the transaction is not a direct
 * `winLeafMatch` call (e.g. sent through another contract), or `undefined`
 * while loading or when the match was not won by a step.
 */
export const useLeafStepProof = (
    match?: Match | null,
): Hex | null | undefined => {
    const hash =
        match?.deletionReason === "STEP" && match.deletionTxHash
            ? match.deletionTxHash
            : undefined;
    const { data: transaction } = useTransaction({
        hash,
        query: { enabled: hash !== undefined, staleTime: Infinity },
    });

    return useMemo(() => {
        if (!transaction) return undefined;
        try {
            const call = decodeFunctionData({
                abi: iTournamentAbi,
                data: transaction.input,
            });
            return call.functionName === "winLeafMatch" ? call.args[3] : null;
        } catch {
            return null;
        }
    }, [transaction]);
};
