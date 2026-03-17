export type TransactionStageStatus = {
    status: "idle" | "pending" | "error" | "success";
    error: Error | null;
};

export type TransactionWaitStatus = {
    status: "error" | "pending" | "success";
    fetchStatus: "fetching" | "idle" | "paused";
    error: Error | null;
};
