import { encodeAbiParameters, getAddress, parseAbi } from "viem";
import { AbiValueParameter, FormSpecification } from "./types";
import { prepareSignatures } from "web/src/components/specification/utils";
import { isBlank, isObject } from "ramda-adjunct";

export const encodeFunctionParams = (params: AbiValueParameter[]) => {
    const values = params.map((param) => {
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

    return encodeAbiParameters(params, values);
};

export const generateFormSpecification = (humanAbi: string) => {
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
