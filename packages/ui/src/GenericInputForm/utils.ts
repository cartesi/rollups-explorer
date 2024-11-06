import { getAddress, parseAbi, parseAbiParameters } from "viem";
import { AbiInputParam, AbiValueParameter, FormSpecification } from "./types";
import { prepareSignatures } from "web/src/components/specification/utils";
import { isArray, isBlank, isObject } from "ramda-adjunct";

export const encodeFunctionParams = (params: AbiValueParameter[]) => {
    return params.map((param) => {
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
    });
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
};
