"use client";
import { createFormContext } from "@mantine/form";
import { Abi, Hex } from "viem";
import { Modes, Predicate, SliceInstruction, Specification } from "../types";

type EditingData = undefined | { originalSpec: Specification };

export type FormMode = "CREATION" | "EDITION";

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
    formMode: FormMode;
    editingData: EditingData;
}

export const [SpecFormProvider, useSpecFormContext, useSpecForm] =
    createFormContext<SpecFormValues>();
