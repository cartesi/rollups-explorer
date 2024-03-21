import { TransactionStageStatus } from "./TransactionStatus";

export const transactionState = (
    prepare: TransactionStageStatus,
    execute: TransactionStageStatus,
    wait: TransactionStageStatus,
    write?: () => void,
    disableOnSuccess: boolean = true,
) => {
    const loading =
        prepare.status === "loading" ||
        execute.status === "loading" ||
        wait.status === "loading";

    const disabled =
        prepare.error != null ||
        (disableOnSuccess && wait.status === "success") ||
        !write;

    return { loading, disabled };
};
