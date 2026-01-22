import { type UseWaitForTransactionReceiptReturnType } from "wagmi";

export type TRANSACTION_TYPE =
    | "ERC-1155"
    | "ERC-20"
    | "ERC-721"
    | "ETHER"
    | "RAW"
    | "ADDRESS-RELAY";

export type TransactionFormSuccessData = {
    receipt: UseWaitForTransactionReceiptReturnType["data"];
    type: TRANSACTION_TYPE;
};
