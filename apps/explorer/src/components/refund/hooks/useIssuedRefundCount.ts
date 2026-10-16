"use client";
import type { Application } from "@cartesi/client";
import { useReadIApplicationGetNumberOfIssuedRefunds } from "@cartesi/react";
import { isNotNil } from "ramda";
import { isForeclosed } from "../../application/utils";

/** Refunds issued by a foreclosed application, read on chain (the node does not index refunds). Not polled. */
export const useIssuedRefundCount = (application: Application | undefined) => {
    const enabled = isNotNil(application) && isForeclosed(application);
    const query = useReadIApplicationGetNumberOfIssuedRefunds({
        address: application?.applicationAddress,
        query: { enabled },
    });

    return {
        count: Number(query.data ?? 0n),
        isLoading: enabled && query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
};
