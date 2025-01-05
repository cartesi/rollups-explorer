import { UseFormReturnType } from "@mantine/form";
import { Hex } from "viem";

export interface FormValues {
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
