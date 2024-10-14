import { Abi, AbiFunction, AbiParameter, Address, Hex } from "viem";

export type FormMode = "hex" | "string" | "abi";

export interface FormSpecification {
    id: string;
    name: string;
    abi: Abi;
}

export type SpecificationMode = "json_abi" | "abi_params";

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
    specificationMode: SpecificationMode;
    humanAbi: string;
    abiParam: string;
    savedAbiParam: string;
    specificationId: string;
    abiFunctionName: string;
    abiFunctionParams: AbiValueParameter[];
}

export interface FormTransformedValues {
    mode: FormMode;
    address: Address;
    rawInput: Hex;
    abiMethod: FormAbiMethod;
    specificationMode: SpecificationMode;
    humanAbi: string;
    abiParam: string;
    savedAbiParam: string;
    specificationId: string;
    abiFunction: AbiFunction | undefined;
    selectedSpecification: FormSpecification | undefined;
}
