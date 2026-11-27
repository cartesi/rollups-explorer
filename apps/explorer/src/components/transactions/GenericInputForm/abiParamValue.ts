import { encodeAbiParameters, getAddress, isAddress, isHex } from "viem";
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

const integerTypeRegex = /^u?int\d*$/;
const bytesTypeRegex = /^bytes\d*$/;

export const toAbiValue = (type: string, value: string) => {
    if (integerTypeRegex.test(type)) {
        return BigInt(value);
    }

    switch (type) {
        case "bool":
            return value === "true";
        case "address":
            return getAddress(value);
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
    if (type === "bool") {
        return value === "true" || value === "false";
    }

    if (
        bytesTypeRegex.test(type) &&
        (!isHex(value) || value.length % 2 !== 0)
    ) {
        return false;
    }

    if (integerTypeRegex.test(type) && value.trim() === "") {
        return false;
    }

    if (type === "address" && !isAddress(value)) {
        return false;
    }

    try {
        encodeAbiParameters([{ type }], [toAbiValue(type, value)]);
        return true;
    } catch {
        return false;
    }
};

export interface ParamValueError {
    position: string;
    message: string;
}

export const getParamValueErrors = (
    param: AbiParamShape,
    value: AbiParamValue,
    position = "",
): ParamValueError[] => {
    const invalid = [
        {
            position,
            message: `Invalid ${param.type} value${position ? ` at ${position}` : ""}`,
        },
    ];
    const arrayType = parseArrayType(param.type);

    if (arrayType) {
        if (
            !Array.isArray(value) ||
            (arrayType.length !== undefined &&
                value.length !== arrayType.length)
        ) {
            return invalid;
        }

        const itemParam = getArrayItemParam(param);

        return value.flatMap((item, index) =>
            getParamValueErrors(itemParam, item, `${position}[${index}]`),
        );
    }

    if (param.type === "tuple") {
        const components = param.components ?? [];

        if (!Array.isArray(value) || value.length !== components.length) {
            return invalid;
        }

        return components.flatMap((component, index) =>
            getParamValueErrors(
                component,
                value[index],
                `${position}.${component.name || index}`,
            ),
        );
    }

    return typeof value === "string" &&
        (value !== "" || param.type === "string") &&
        isValidPrimitiveValue(param.type, value)
        ? []
        : invalid;
};

export const getParamValueError = (
    param: AbiParamShape,
    value: AbiParamValue,
) => getParamValueErrors(param, value)[0]?.message ?? null;
