import { isBlank } from "ramda-adjunct";
import { isAddress, isHex, parseAbi, parseAbiParameters } from "viem";
import { getParamValueError } from "./abiParamValue";
import type { AbiParamValue, FormValues } from "./types";
import { prepareSignatures } from "./utils";

export const validateApplication = (value: string) =>
    value !== "" && isAddress(value) ? null : "Invalid application";

export const validateHexInput = (value: string) =>
    isHex(value) ? null : "Invalid hex value";

export const validateAbiMethod = (value: string, values: FormValues) =>
    values.mode !== "abi" || value === "new" || value === "existing"
        ? null
        : "Invalid ABI method";

export const validateSpecificationId = (value: string, values: FormValues) =>
    values.mode !== "abi" ||
    (values.abiMethod === "new" && values.specificationMode === "json_abi") ||
    value !== ""
        ? null
        : "Invalid specification";

export const validateAbiFunctionName = (value: string, values: FormValues) =>
    values.mode !== "abi" ||
    values.specificationMode !== "json_abi" ||
    value !== ""
        ? null
        : "Invalid ABI function";

export const validateAbiFunctionParamValue = (
    value: AbiParamValue,
    values: FormValues,
    key: string,
) => {
    if (values.mode !== "abi") {
        return null;
    }

    const [paramIndex] = key
        .split(".")
        .map((part) => parseInt(part))
        .filter((n) => !isNaN(n));
    const param = values.abiFunctionParams[paramIndex];

    if (!param) {
        return null;
    }

    return getParamValueError(param, value);
};

export const validateHumanAbi = (value: string, values: FormValues) => {
    if (values.mode !== "abi") {
        return null;
    }

    if (
        values.abiMethod === "existing" ||
        values.specificationMode === "abi_params"
    ) {
        return null;
    }

    if (isBlank(value)) {
        return "The ABI signature definition is required";
    }

    const items = prepareSignatures(value);
    try {
        parseAbi(items);
    } catch (error: unknown) {
        return (error as Error).message;
    }

    return null;
};

export const validateAbiParam = (value: string, values: FormValues) => {
    if (values.mode !== "abi") {
        return null;
    }

    if (
        values.abiMethod === "existing" ||
        values.specificationMode === "json_abi"
    ) {
        return null;
    }

    if (isBlank(value)) {
        return "ABI parameter is required.";
    }

    try {
        parseAbiParameters(value);
        return null;
    } catch (error: unknown) {
        return (error as Error).message as string;
    }
};
