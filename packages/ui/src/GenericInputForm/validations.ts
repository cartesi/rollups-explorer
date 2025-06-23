import { isBlank } from "ramda-adjunct";
import { isAddress, isHex, parseAbi, parseAbiParameters } from "viem";
import { FormValues } from "./types";
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
    value: string,
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

    const message = `Invalid ${param.type} value`;
    let error: string | null = null;

    // Validate the field for non-empty content
    if (value === "") {
        return message;
    }

    // Otherwise, if some content exists, validate it based on the type
    switch (param.type) {
        case "uint":
        case "uint8":
        case "uint16":
        case "uint32":
        case "uint64":
        case "uint128":
        case "uint256":
            try {
                BigInt(value);
            } catch (e) {
                error = message;
            }
            break;
        case "bool":
            error = value === "true" || value === "false" ? null : message;
            break;
        case "bytes":
            error = isHex(value) ? null : message;
            break;
        case "address":
            error = isAddress(value) ? null : message;
            break;
        // All other types like 'string' are handled in the non-empty content check above
        default:
            break;
    }

    return error;
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
    } catch (error: any) {
        return error.message;
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
    } catch (error: any) {
        return error.message as string;
    }
};
