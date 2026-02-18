import { type AbiType } from "abitype";
import { type Abi } from "viem";

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
        value: "decodedData.applicationContract",
        label: "Application Address",
        programmingLabel: "applicationAddress",
    },
    {
        value: "decodedData.sender",
        label: "Sender",
        programmingLabel: "sender",
    },
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
    /** A flag to signal to the decoder not to throw an exception caused by slicing the defined byte range.*/
    optional?: boolean;
}

type Commons = {
    name: string;
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

/**
 * A saved instance always has the ID and timestamp.
 */
export type DbSpecification = Specification & { id: string; timestamp: number };

export interface Repository {
    add: (entity: Specification) => Promise<DbSpecification>;
    update: (entity: DbSpecification) => Promise<DbSpecification>;
    remove: (id: string) => Promise<boolean>;
    get: (id: string) => Promise<Specification | null>;
    list: () => Promise<DbSpecification[]>;
}

export interface SpecificationTransfer {
    name: "cartesiscan_specifications_export";
    version: number;
    timestamp: number;
    specifications: DbSpecification[];
}

export const SPECIFICATION_TRANSFER_NAME =
    "cartesiscan_specifications_export" as const;
