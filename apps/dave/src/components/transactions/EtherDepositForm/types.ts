import { type UseFormReturnType } from "@mantine/form";
import { type Hex } from "viem";
import { type UseAccountBalanceResult } from "../hooks/useAccountBalance";

export interface FormValues {
    accountBalance: UseAccountBalanceResult;
    application: string;
    amount: string;
    execLayerData: string;
}

export interface TransformedValues {
    address: Hex;
    amount: bigint | undefined;
    execLayerData: Hex;
}

export type TransformValues = (v: FormValues) => TransformedValues;
export type EtherDepositFormReturn = UseFormReturnType<
    FormValues,
    TransformValues
>;
