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
    tupleName?: string;
};

export type AbiInputParam = AbiValueParameter & {
    tupleName?: string;
    id?: string;
    components: AbiInputParam[];
};

export type GenericFormAbiFunction = Omit<AbiFunction, "inputs"> & {
    inputs: AbiInputParam[];
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
    abiFunctionName: string;
    abiFunction: GenericFormAbiFunction | undefined;
    selectedSpecification: FormSpecification | undefined;
}

export type FinalValues = (string | bigint | boolean | FinalValues)[];
