import { createFormContext } from "@mantine/form";
import { Abi, Hex } from "viem";
import { Modes, Predicate, SliceInstruction } from "./types";

/**
 * Form context to support both specification form inputs and preview inputs
 */
export interface SpecFormValues {
    name: string;
    mode: Modes;
    abiParamEntry: string;
    abiParams: string[];
    abi?: Abi;
    sliceInstructions: SliceInstruction[];
    sliceTarget?: string;
    conditionals: Predicate[];
    encodedData?: string;
    conditionalsOn: boolean;
    sliceInstructionsOn: boolean;
}

export interface SpecTransformedValues {
    name: string;
    sliceTarget?: string;
    sliceInstructions: SliceInstruction[];
    conditionals?: Predicate[];
    mode: Modes;
    abi?: Abi;
    abiParams?: readonly string[];
    encodedData?: Hex;
    humanReadable: string;
}

type TransformValues = (a: SpecFormValues) => SpecTransformedValues;

export const [SpecFormProvider, useSpecFormContext, useSpecForm] =
    createFormContext<SpecFormValues, TransformValues>();
