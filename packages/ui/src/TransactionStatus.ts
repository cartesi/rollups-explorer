export type TransactionStageStatus = {
    status: "error" | "pending" | "success" | "idle" | "loading";
    error: Error | null;
};

export type TransactionWaitStatus = {
    status: "error" | "pending" | "success";
    fetchStatus: "fetching" | "idle" | "paused";
    error: Error | null;
};
