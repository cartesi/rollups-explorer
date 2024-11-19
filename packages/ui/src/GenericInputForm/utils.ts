import { AbiParameter, getAddress, parseAbi, parseAbiParameters } from "viem";
import {
    AbiInputParam,
    AbiValueParameter,
    FormSpecification,
    FinalValues,
    FormValues,
    FormTransformedValues,
} from "./types";
import { prepareSignatures } from "web/src/components/specification/utils";
import { isArray, isBlank, isObject } from "ramda-adjunct";
import { UseFormReturnType } from "@mantine/form";
import { v4 as uuidv4 } from "uuid";

export const encodeFunctionParam = (param: AbiValueParameter) => {
    switch (param.type) {
        case "bool":
            return param.value === "true";
        case "address":
            return getAddress(param.value);
        case "uint":
        case "uint8":
        case "uint16":
        case "uint32":
        case "uint64":
        case "uint128":
        case "uint256":
            return BigInt(param.value);
        default:
            return param.value;
    }
};

export const generateHumanAbiFormSpecification = (humanAbi: string) => {
    if (isBlank(humanAbi)) {
        return undefined;
    }

    const readableList = prepareSignatures(humanAbi);
    let generatedAbi;
    try {
        generatedAbi = parseAbi(readableList);
    } catch (err) {}

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
    } catch (err) {}

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
    if (parentInput.components) {
        parentInput.components.forEach((input: AbiInputParam) => {
            if (input.type === "tuple") {
                generateInitialValues(input, flatInputs);
            } else {
                const flatInput: AbiInputParam = {
                    ...input,
                    value: "",
                };

                flatInputs.push(flatInput);
            }
        });
    } else {
        flatInputs.push({
            ...parentInput,
            value: "",
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

const getTupleInputs = (
    tupleInput: AbiInputParam,
    finalArr: AbiParameter[],
) => {
    tupleInput.components.forEach((input) => {
        if (input.type === "tuple") {
            getTupleInputs(input, finalArr);
        } else {
            finalArr.push(input);
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
