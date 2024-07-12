import { isBlank, isNilOrEmpty, isNotNilOrEmpty } from "ramda-adjunct";
import { Abi, Hex, isHex } from "viem";
import { Modes, Predicate, SliceInstruction } from "../types";
import { SpecFormValues } from "./context";

const specNameValidation = (value: string, values: SpecFormValues) => {
    if (isBlank(value)) return "Name is required.";

    return null;
};

const specModeValidation = (value: Modes, values: SpecFormValues) => {
    if (isBlank(value)) return "Specification mode is required!";

    return null;
};

const specABIValidation = (value: Abi | undefined, values: SpecFormValues) => {
    if (values.mode !== "json_abi") return null;

    if (isNilOrEmpty(value)) return "The ABI is required on JSON ABI mode.";

    return null;
};

const specAbiParamValidation = (value: string[], values: SpecFormValues) => {
    if (values.mode === "abi_params") {
        if (!values.sliceInstructionsOn && isNilOrEmpty(value))
            return "At least one ABI parameter is required when not defining the byte range slices.";

        if (
            values.sliceInstructionsOn &&
            isNotNilOrEmpty(values.sliceTarget) &&
            isNilOrEmpty(value)
        )
            return `A slice name ${values.sliceTarget} was selected, making ABI parameter required!`;
    }

    return null;
};

const specSliceInstructionsValidation = (
    value: SliceInstruction[],
    values: SpecFormValues,
) => {
    if (values.mode === "abi_params" && values.sliceInstructionsOn) {
        if (isNilOrEmpty(value))
            return "Byte range is on, so at least one slice is required!";
    }

    return null;
};

const specConditionalsValidation = (
    value: Predicate[],
    values: SpecFormValues,
) => {
    if (values.conditionalsOn && isNilOrEmpty(value))
        return "Conditions is on, make sure the empty fields are filled!";

    return null;
};

const specEncodedDataValidation = (value: Hex | undefined) => {
    if (!isBlank(value) && !isHex(value))
        return "Encoded data should be in Hex format!";

    return null;
};

export {
    specABIValidation,
    specAbiParamValidation,
    specConditionalsValidation,
    specEncodedDataValidation,
    specModeValidation,
    specNameValidation,
    specSliceInstructionsValidation,
};
