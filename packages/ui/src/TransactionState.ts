import {
    TransactionStageStatus,
    TransactionWaitStatus,
} from "./TransactionStatus";

export const transactionState = (
    prepare: TransactionWaitStatus,
    execute: TransactionStageStatus,
    wait: TransactionWaitStatus,
    disableOnSuccess: boolean = true,
) => {
    const loading =
        prepare.fetchStatus === "fetching" ||
        execute.status === "pending" ||
        wait.fetchStatus === "fetching";

    const disabled =
        prepare.error !== null ||
        (disableOnSuccess && wait.status === "success");

    return { loading, disabled };
};
