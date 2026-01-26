import { createFormContext } from "@mantine/form";
import type { Address, Hex } from "viem";

export type DepositData = {
    tokenId: bigint;
    name?: string;
    amount: bigint;
    id: Hex;
};

type Amounts = bigint[];
type TokenIds = bigint[];

export type DepositDataTuple = [bigint, bigint];
export type BatchTuple = [TokenIds, Amounts];

export type Mode = "single" | "batch";
export interface FormValues {
    mode: Mode;
    application: string;
    erc1155Address: string;
    tokenId: string;
    amount: string;
    execLayerData: Hex;
    baseLayerData: Hex;
    decimals: number;
    balance: bigint;
    batch?: DepositData[];
}

export interface TransformedValues {
    applicationAddress: Address;
    erc1155Address: Address;
    tokenId?: bigint;
    amount?: bigint;
    execLayerData: Hex;
    baseLayerData: Hex;
    batchAsLists?: BatchTuple;
}

type TransformValues = (a: FormValues) => TransformedValues;

export const [FormProvider, useFormContext, useForm] = createFormContext<
    FormValues,
    TransformValues
>();
