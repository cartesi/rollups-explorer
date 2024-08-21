import { AbiType } from "abitype";
import { Abi } from "viem";
import { IRepository } from "../../interfaces/Repository";

export const JSON_ABI = "json_abi" as const;
export const ABI_PARAMS = "abi_params" as const;
export const specModes = [JSON_ABI, ABI_PARAMS] as const;
export const operators = [
    { value: "equals", label: "Equal", programmingLabel: "===" },
] as const;
export const logicalOperators = [
    { value: "and", label: "AND", programmingLabel: "&&" },
    { value: "or", label: "OR", programmingLabel: "||" },
] as const;
export const inputProperties = [
    {
        value: "application.address",
        label: "Application Address",
        programmingLabel: "applicationAddress",
    },
    { value: "msgSender", label: "Sender", programmingLabel: "sender" },
] as const;

export type Modes = (typeof specModes)[number];
export type Operator = (typeof operators)[number]["value"];
export type ConditionalOperator = (typeof logicalOperators)[number]["value"];
export type FieldPath = (typeof inputProperties)[number]["value"];

export interface Condition {
    operator: Operator;
    field: FieldPath;
    value: string;
}

export interface Predicate {
    logicalOperator: ConditionalOperator;
    conditions: Condition[];
}

export interface SliceInstruction {
    /** Start index of the hex or byte-array*/
    from: number;
    /** End index of the hex or byte-array. Undefined means getting from start onwards e.g. arbitrary data size.*/
    to?: number;
    /** A name for the final decoded object or for reference when the slice is a target for abi-params decoding*/
    name?: string;
    /** The type to decode e.g. uint. Leaving empty will default to the raw sliced return; useful for Address for example.*/
    type?: AbiType;
}

type Commons = {
    id?: string;
    name: string;
    timestamp?: number;
    conditionals?: Predicate[];
    /** Reference to the implementation version. Not controlled by user.*/
    version?: number;
};
export interface AbiParamsSpecification extends Commons {
    mode: "abi_params";
    /** List of human readable ABI format entries*/
    abiParams: readonly string[];
    /** Optional: instructions to treat the encoded data before applying the abiParams definition to a specific named part.*/
    sliceInstructions?: SliceInstruction[];
    /** Optional: find a named sliced data and decode it applying the defined values set on abiParams property. */
    sliceTarget?: string;
}

export interface JSONAbiSpecification extends Commons {
    mode: "json_abi";
    /** Full fledge-json-abi to decode encoded data with 4 bytes selector + any arguments it has. */
    abi: Abi;
}

export type Specification = AbiParamsSpecification | JSONAbiSpecification;

export type Repository = IRepository<Specification, "id">;

export interface SpecificationTransfer {
    name: "cartesiscan_specifications_export";
    version: number;
    timestamp: number;
    specifications: Specification[];
}

export type ValidationType = "success" | "error";

export const SPECIFICATION_TRANSFER_NAME =
    "cartesiscan_specifications_export" as const;
