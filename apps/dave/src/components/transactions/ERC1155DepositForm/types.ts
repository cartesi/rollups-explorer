import type { Application } from "@cartesi/viem";
import type { TransactionFormSuccessData } from "../DepositFormTypes";

export interface ERC1155DepositFormProps {
    mode: "single" | "batch";
    application: Application;
    onSuccess: (receipt: TransactionFormSuccessData) => void;
}
