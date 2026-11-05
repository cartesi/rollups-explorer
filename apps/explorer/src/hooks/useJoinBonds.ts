"use client";
import type { Commitment, Tournament } from "@cartesi/client";
import { useQueries } from "@tanstack/react-query";
import { uniq } from "ramda";
import type { Hash } from "viem";
import { useConfig } from "wagmi";
import { getTransaction } from "wagmi/actions";
import { toJoinBond, type JoinBond } from "../lib/bondUtils";

/**
 * Resolve the bond each commitment posted when it joined the tournament. The
 * amount is exact for a direct join, read from its transaction, and the
 * tournament bond value otherwise. Transactions never change, so each is
 * fetched once.
 * @returns the bonds by commitment, filled as data arrives, and whether any
 * transaction is still being fetched.
 */
export const useJoinBonds = (
    tournament:
        | (Pick<Tournament, "address"> & Partial<Pick<Tournament, "bondValue">>)
        | null
        | undefined,
    commitments: Commitment[],
) => {
    const config = useConfig();
    const chainId = config.state.chainId;
    const txHashes = uniq(commitments.map(({ txHash }) => txHash));

    const transactions = useQueries({
        queries: txHashes.map((hash) => ({
            queryKey: ["transaction", chainId, hash],
            queryFn: () => getTransaction(config, { hash }),
            staleTime: Infinity,
            retry: 1,
        })),
        combine: (results) => ({
            byHash: new Map(
                txHashes.flatMap((hash, index) => {
                    const transaction = results[index].data;
                    return transaction ? [[hash, transaction] as const] : [];
                }),
            ),
            isLoading: results.some((result) => result.isPending),
        }),
    });

    const bonds = new Map<Hash, JoinBond>(
        tournament
            ? commitments.flatMap((commitment) => {
                  const bond = toJoinBond(
                      tournament,
                      commitment,
                      transactions.byHash.get(commitment.txHash),
                      tournament.bondValue,
                  );
                  return bond ? [[commitment.commitment, bond] as const] : [];
              })
            : [],
    );

    return { bonds, isLoading: transactions.isLoading };
};
