import { encodeAbiParameters, getAddress } from "viem";
import { AbiValueParameter } from "./types";

export const encodeFunctionParams = (params: AbiValueParameter[]) => {
    const values = params.map((param) => {
        switch (param.type) {
            case "bool":
                // Assume that the value can either be 'true' or 'false'
                // because it was already validated for those exact values
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
            // No encoding required for other types like 'string' or 'bytes'
            default:
                return param.value;
        }
    });

    return encodeAbiParameters(params, values);
};
