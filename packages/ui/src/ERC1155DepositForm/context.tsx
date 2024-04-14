import { createFormContext } from "@mantine/form";
import { Address, Hex } from "viem";

type Transfer = Record<string, string>;
interface FormValues {
    mode: "single" | "batch";
    application: string;
    erc1155Address: string;
    tokenId: string;
    amount: string;
    execLayerData: Hex;
    baseLayerData: Hex;
    decimals: number;
    batch?: Transfer;
}

interface TransformedValues {
    applicationAddress: Address;
    erc1155Address: Address;
    tokenId?: bigint;
    amount?: bigint;
    execLayerData: Hex;
    baseLayerData: Hex;
}

type TransformValues = (a: FormValues) => TransformedValues;

export const [FormProvider, useFormContext, useForm] = createFormContext<
    FormValues,
    TransformValues
>();
