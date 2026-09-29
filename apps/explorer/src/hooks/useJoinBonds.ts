"use client";
import type { Commitment, Tournament } from "@cartesi/client";
import { useReadITournamentBondValue } from "@cartesi/react";
import { useQueries } from "@tanstack/react-query";
import { isNotNil, uniq } from "ramda";
import type { Hash } from "viem";
import { useConfig } from "wagmi";
import { getTransaction } from "wagmi/actions";
import { toJoinBond, type JoinBond } from "../lib/bondUtils";

/**
 * Resolve the bond each commitment posted when it joined the tournament. The
 * amount is exact for a direct join, read from its transaction, and the
 * tournament bond value otherwise. Transactions and the bond value never
 * change, so each is fetched once.
 * @returns the bond value, the bonds by commitment, filled as data arrives,
 * and whether anything is still being fetched.
 */
export const useJoinBonds = (
    tournament: Tournament | null | undefined,
    commitments: Commitment[],
) => {
    const config = useConfig();
    const chainId = config.state.chainId;
    const bondValueQuery = useReadITournamentBondValue({
        address: tournament?.address,
        query: { enabled: isNotNil(tournament), staleTime: Infinity },
    });
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

    const bondValue = bondValueQuery.data;
    const bonds = new Map<Hash, JoinBond>(
        tournament
            ? commitments.flatMap((commitment) => {
                  const bond = toJoinBond(
                      tournament,
                      commitment,
                      transactions.byHash.get(commitment.txHash),
                      bondValue,
                  );
                  return bond ? [[commitment.commitment, bond] as const] : [];
              })
            : [],
    );

    return {
        bondValue,
        bonds,
        isLoading:
            (isNotNil(tournament) && bondValueQuery.isPending) ||
            transactions.isLoading,
    };
};
