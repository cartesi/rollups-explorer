import { AbiParameter, getAddress, parseAbi, parseAbiParameters } from "viem";
import {
    AbiInputParam,
    AbiValueParameter,
    FormSpecification,
    FinalValues,
} from "./types";
import { prepareSignatures } from "web/src/components/specification/utils";
import { isArray, isBlank, isObject } from "ramda-adjunct";

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
              id: new Date().getTime().toString(),
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
              id: new Date().getTime().toString(),
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

                if (parentInput.type === "tuple") {
                    flatInput.tupleName = parentInput.name;
                }

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

export const generateFinalValues = (
    inputs: AbiParameter[],
    params: AbiValueParameter[],
) => {
    const finalArr: FinalValues = [];

    inputs.forEach((input) => {
        if (input.type === "tuple") {
            const currArr: FinalValues = [];
            finalArr.push(currArr);

            getTupleValues(input as AbiInputParam, params, finalArr, currArr);
        } else {
            const param = params.find((p) => {
                return p.name === input.name && p.type === input.type;
            }) as AbiValueParameter;
            const value = encodeFunctionParam(param);
            finalArr.push(value);
        }
    });

    return finalArr;
};

const getTupleValues = (
    tupleInput: AbiInputParam,
    params: AbiValueParameter[],
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
                return (
                    p.tupleName === tupleInput.name &&
                    p.name === input.name &&
                    p.type === input.type
                );
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

export const getInputIndexOffset = (inputs: AbiInputParam[]) => {
    const nestedInputs: AbiParameter[] = [];

    inputs.forEach((input) => {
        if (input.type === "tuple") {
            getTupleInputs(input, nestedInputs);
        } else {
            nestedInputs.push(input);
        }
    });

    return nestedInputs.length;
};
