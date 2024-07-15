import { createFormContext } from "@mantine/form";
import { Abi, Hex } from "viem";
import { Modes, Predicate, SliceInstruction } from "../types";

/**
 * Form context to support both specification form inputs and preview inputs
 */
export interface SpecFormValues {
    name: string;
    mode: Modes;
    abiParams: string[];
    abi?: Abi;
    sliceInstructions: SliceInstruction[];
    sliceTarget?: string;
    conditionals: Predicate[];
    encodedData?: Hex;
    conditionalsOn: boolean;
    sliceInstructionsOn: boolean;
}

export const [SpecFormProvider, useSpecFormContext, useSpecForm] =
    createFormContext<SpecFormValues>();
