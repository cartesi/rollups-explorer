import type { Hex } from "viem";

type ListInputsParams = { applicationId: string | Hex; epochIndex: number };

const queryKeys = {
    all: () => ["inputs"] as const,
    lists: (appId: string | Hex, epochIndex: number) =>
        [...queryKeys.all(), "app", appId, "epoch", epochIndex] as const,
    list: ({ applicationId, epochIndex }: ListInputsParams) =>
        [...queryKeys.lists(applicationId, epochIndex), "list"] as const,
};

export const inputQueryKeys = queryKeys;
