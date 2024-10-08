import { Abi, AbiFunction, Address, Hex } from "viem";

export type FormMode = "hex" | "string" | "abi";

export interface FormSpecification {
    id: string;
    name: string;
    abi: Abi;
}

export type FormAbiMethod = "new" | "existing";

export interface FormValues {
    mode: FormMode;
    application: string;
    rawInput: Hex;
    stringInput: string;
    abiMethod: FormAbiMethod;
    specificationId: string;
    abiFunctionName: string;
}

export interface FormTransformedValues {
    mode: FormMode;
    address: Address;
    rawInput: Hex;
    abiMethod: FormAbiMethod;
    specificationId: string;
    abiFunction: AbiFunction | undefined;
    selectedSpecification: FormSpecification | undefined;
}
