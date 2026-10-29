import { isBlank } from "ramda-adjunct";
import { isAddress, isHex, parseAbi, parseAbiParameters } from "viem";
import type { AbiParamShape, AbiParamValue, FormValues } from "./types";
import { getArrayItemParam, parseArrayType, prepareSignatures } from "./utils";

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

const isValidPrimitiveValue = (type: string, value: string) => {
    switch (type) {
        case "uint":
        case "uint8":
        case "uint16":
        case "uint32":
        case "uint64":
        case "uint128":
        case "uint256":
            try {
                BigInt(value);
                return true;
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e: unknown) {
                return false;
            }
        case "bool":
            return value === "true" || value === "false";
        case "bytes":
            return isHex(value);
        case "address":
            return isAddress(value);
        // All other types like 'string' are only validated for non-empty content
        default:
            return true;
    }
};

export const getParamValueError = (
    param: AbiParamShape,
    value: AbiParamValue,
    position = "",
): string | null => {
    const message = `Invalid ${param.type} value${position ? ` at ${position}` : ""}`;
    const arrayType = parseArrayType(param.type);

    if (arrayType) {
        if (
            !Array.isArray(value) ||
            (arrayType.length !== undefined &&
                value.length !== arrayType.length)
        ) {
            return message;
        }

        const itemParam = getArrayItemParam(param);

        for (const [index, item] of value.entries()) {
            const error = getParamValueError(
                itemParam,
                item,
                `${position}[${index}]`,
            );

            if (error) {
                return error;
            }
        }

        return null;
    }

    if (param.type === "tuple") {
        const components = param.components ?? [];

        if (!Array.isArray(value) || value.length !== components.length) {
            return message;
        }

        for (const [index, component] of components.entries()) {
            const error = getParamValueError(
                component,
                value[index],
                `${position}.${component.name || index}`,
            );

            if (error) {
                return error;
            }
        }

        return null;
    }

    return typeof value === "string" &&
        value !== "" &&
        isValidPrimitiveValue(param.type, value)
        ? null
        : message;
};

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
