import { Abi, AbiFunction, Address, Hex, AbiParameter } from "viem";

export type FormMode = "hex" | "string" | "abi";

export interface FormSpecification {
    id: string;
    name: string;
    abi: Abi;
}

export type FormAbiMethod = "new" | "existing";

export type AbiValueParameter = Pick<AbiParameter, "type" | "name"> & {
    value: string;
};

export interface FormValues {
    mode: FormMode;
    application: string;
    rawInput: Hex;
    stringInput: string;
    abiMethod: FormAbiMethod;
    specificationId: string;
    abiFunctionName: string;
    abiFunctionParams: AbiValueParameter[];
}

export interface FormTransformedValues {
    mode: FormMode;
    address: Address;
    rawInput: Hex;
    abiMethod: FormAbiMethod;
    specificationId: string;
    abiFunction: AbiFunction | undefined;
}
