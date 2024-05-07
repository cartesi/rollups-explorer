import { UseWaitForTransactionReceiptReturnType } from "wagmi";

export type DEPOSIT_TYPE = "ERC-1155" | "ERC-20" | "ERC-721" | "ETHER" | "RAW";

export type DepositFormSuccessData = {
    receipt: UseWaitForTransactionReceiptReturnType["data"];
    type: DEPOSIT_TYPE;
};
