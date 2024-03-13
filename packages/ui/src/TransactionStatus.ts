export type TransactionStageStatus = {
    status: "error" | "pending" | "success" | "idle" | "loading";
    error: Error | null;
};
