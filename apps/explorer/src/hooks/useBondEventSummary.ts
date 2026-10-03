"use client";
import type { BondEvent } from "@cartesi/client";
import { serverUrl, useCartesiClient } from "@cartesi/react";
import { useQuery } from "@tanstack/react-query";
import { getBondAccounts, getBondTotals } from "../lib/bondUtils";

/**
 * Largest page the node serves for a list call.
 */
export const bondEventSummaryPageSize = 10_000;

export type UseBondEventSummaryParams = {
    application: string;
    epochIndex?: bigint;
    /**
     * Total of events matching the filter, as reported by the paginated list.
     */
    totalCount?: number;
};

/**
 * Sum the bond movements of every event of one epoch. The events are fetched
 * in pages bounded by the total count the paginated list already reported.
 */
export const useBondEventSummary = (params: UseBondEventSummaryParams) => {
    const client = useCartesiClient();
    const { application, epochIndex, totalCount = 0 } = params;

    return useQuery({
        queryKey: [
            serverUrl(client),
            "bondEventSummary",
            application,
            epochIndex?.toString(),
            totalCount,
        ],
        queryFn: async () => {
            const events: BondEvent[] = [];
            for (
                let offset = 0;
                offset < totalCount;
                offset += bondEventSummaryPageSize
            ) {
                const page = await client.listBondEvents({
                    application,
                    epochIndex,
                    limit: bondEventSummaryPageSize,
                    offset,
                });
                events.push(...page.data);
            }
            return {
                accounts: getBondAccounts(events),
                totals: getBondTotals(events),
            };
        },
        enabled: epochIndex !== undefined && totalCount > 0,
    });
};
