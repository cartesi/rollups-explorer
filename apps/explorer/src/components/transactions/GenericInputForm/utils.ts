import { type UseFormReturnType } from "@mantine/form";
import { isArray, isBlank, isObject } from "ramda-adjunct";
import { v4 as uuidv4 } from "uuid";
import { getAddress, parseAbi, parseAbiParameters } from "viem";
import type {
    AbiInputParam,
    AbiParamShape,
    AbiParamValue,
    AbiValueParameter,
    FinalValues,
    FormSpecification,
    FormTransformedValues,
    FormValues,
} from "./types";

export const prepareSignatures = (multiline: string) =>
    multiline.split("\n").map((signature) => signature?.trim());

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

const encodePrimitiveValue = (type: string, value: string) => {
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

export const encodeParamValue = (
    param: AbiParamShape,
    value: AbiParamValue,
): FinalValues[number] => {
    if (isArrayType(param.type)) {
        const itemParam = getArrayItemParam(param);
        return (value as AbiParamValue[]).map((item) =>
            encodeParamValue(itemParam, item),
        );
    }

    if (param.type === "tuple") {
        const values = value as AbiParamValue[];
        return (param.components ?? []).map((component, index) =>
            encodeParamValue(component, values[index]),
        );
    }

    return encodePrimitiveValue(param.type, value as string);
};

export const encodeFunctionParam = (param: AbiValueParameter) =>
    encodeParamValue(param, param.value);

export const generateHumanAbiFormSpecification = (humanAbi: string) => {
    if (isBlank(humanAbi)) {
        return undefined;
    }

    const readableList = prepareSignatures(humanAbi);
    let generatedAbi;
    try {
        generatedAbi = parseAbi(readableList);
    } catch (err) {
        console.error(err);
    }

    return isObject(generatedAbi)
        ? ({
              id: uuidv4(),
              name: "Generated specification",
              abi: generatedAbi,
          } as FormSpecification)
        : undefined;
};

export const generateAbiParamFormSpecification = (abiParam: string) => {
    let abiParameters;

    try {
        abiParameters = parseAbiParameters(abiParam);
    } catch (err) {
        console.error(err);
    }

    return isArray(abiParameters)
        ? ({
              id: uuidv4(),
              name: "Generated specification",
              abi: [
                  {
                      inputs: abiParameters,
                      name: "",
                      outputs: [],
                      stateMutability: "view",
                      type: "function",
                  },
              ],
          } as FormSpecification)
        : undefined;
};

export const generateInitialValues = (
    parentInput: AbiInputParam,
    flatInputs: AbiInputParam[],
) => {
    if (parentInput.type === "tuple") {
        parentInput.components.forEach((input: AbiInputParam) => {
            if (input.type === "tuple") {
                generateInitialValues(input, flatInputs);
            } else {
                const flatInput: AbiInputParam = {
                    ...input,
                    value: generateEmptyValue(input),
                };

                flatInputs.push(flatInput);
            }
        });
    } else {
        flatInputs.push({
            ...parentInput,
            value: generateEmptyValue(parentInput),
        });
    }
};

export const augmentInputsWithIds = (
    parentInput: AbiInputParam,
): AbiInputParam[] => {
    return parentInput.components.map((input: AbiInputParam) => {
        const nextInput = { ...input, id: uuidv4() };

        if (nextInput.type === "tuple") {
            nextInput.components = augmentInputsWithIds(input);
        }

        return nextInput;
    });
};

export const generateFinalValues = (
    inputs: AbiInputParam[],
    params: AbiInputParam[],
) => {
    const finalArr: FinalValues = [];

    inputs.forEach((input) => {
        if (input.type === "tuple") {
            const currArr: FinalValues = [];
            finalArr.push(currArr);

            getTupleValues(input, params, finalArr, currArr);
        } else {
            const param = params.find((p) => {
                return p.id === input.id;
            }) as AbiValueParameter;
            const value = encodeFunctionParam(param);
            finalArr.push(value);
        }
    });

    return finalArr;
};

const getTupleValues = (
    tupleInput: AbiInputParam,
    params: AbiInputParam[],
    finalArr: FinalValues = [],
    currentArr: FinalValues = [],
) => {
    tupleInput.components.forEach((input) => {
        if (input.type === "tuple") {
            const nextCurrentArr: FinalValues = [];
            currentArr.push(nextCurrentArr);
            getTupleValues(input, params, finalArr, nextCurrentArr);
        } else {
            const param = params.find((p) => {
                return p.id === input.id;
            }) as AbiValueParameter;
            const value = encodeFunctionParam(param);
            currentArr.push(value);
        }
    });
};

export const resetAbiFunctionParams = (
    form: UseFormReturnType<
        FormValues,
        (values: FormValues) => FormTransformedValues
    >,
    inputs: AbiInputParam[],
) => {
    const emptyFunctionParams: AbiInputParam[] = [];
    (inputs as AbiInputParam[]).forEach((input) => {
        generateInitialValues(input, emptyFunctionParams);
    });

    const prevAbiFunctionParams = form.getInputProps("abiFunctionParams");

    if (isArray(prevAbiFunctionParams.value)) {
        prevAbiFunctionParams.value.forEach((_, index) => {
            form.setFieldError(`abiFunctionParams.${index}.value`, null);
        });
    }

    form.setFieldValue("abiFunctionParams", emptyFunctionParams);
};
