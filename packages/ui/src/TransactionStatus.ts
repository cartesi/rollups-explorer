export type TransactionStageStatus = {
    status: "error" | "loading" | "success" | "idle";
    error: Error | null;
};
