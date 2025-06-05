import { Hex } from "viem";

export interface FormValues {
    application: string;
    amount: string;
    execLayerData: string;
    erc20Address: string;
    decimals?: number;
}

export interface TransformedValues {
    address: Hex;
    execLayerData: Hex;
    erc20Address: Hex;
    erc20ContractAddress: Hex | undefined;
    amountBigInt: bigint | undefined;
}

export type TransformValues = (v: FormValues) => TransformedValues;
