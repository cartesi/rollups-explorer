import { getAddress, isAddress, isHex } from "viem";
import type { AbiParamShape, AbiParamValue, FinalValues } from "./types";

const arrayTypeRegex = /^(.+)\[(\d*)\]$/;

export const parseArrayType = (type: string) => {
    const match = type.match(arrayTypeRegex);

    if (!match) {
        return undefined;
    }

    const [, itemType, length] = match;

    return {
        itemType,
        length: length === "" ? undefined : Number(length),
    };
};

export const isArrayType = (type: string) => arrayTypeRegex.test(type);

export const getArrayItemParam = <T extends AbiParamShape>(param: T): T => ({
    ...param,
    name: "",
    type: parseArrayType(param.type)?.itemType ?? param.type,
});

export const generateEmptyValue = (param: AbiParamShape): AbiParamValue => {
    const arrayType = parseArrayType(param.type);

    if (arrayType) {
        const itemParam = getArrayItemParam(param);
        return Array.from({ length: arrayType.length ?? 0 }, () =>
            generateEmptyValue(itemParam),
        );
    }

    if (param.type === "tuple") {
        return (param.components ?? []).map(generateEmptyValue);
    }

    return "";
};

export const toAbiValue = (type: string, value: string) => {
    switch (type) {
        case "bool":
            return value === "true";
        case "address":
            return getAddress(value);
        case "uint":
        case "uint8":
        case "uint16":
        case "uint32":
        case "uint64":
        case "uint128":
        case "uint256":
            return BigInt(value);
        default:
            return value;
    }
};

export const parseParamValue = (
    param: AbiParamShape,
    value: AbiParamValue,
): FinalValues[number] => {
    if (isArrayType(param.type)) {
        const itemParam = getArrayItemParam(param);
        return (value as AbiParamValue[]).map((item) =>
            parseParamValue(itemParam, item),
        );
    }

    if (param.type === "tuple") {
        const values = value as AbiParamValue[];
        return (param.components ?? []).map((component, index) =>
            parseParamValue(component, values[index]),
        );
    }

    return toAbiValue(param.type, value as string);
};

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
