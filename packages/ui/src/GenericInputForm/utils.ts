import { encodeAbiParameters, getAddress } from "viem";
import { AbiValueParameter } from "./types";

export const encodeFunctionParams = (params: AbiValueParameter[]) => {
    const values = params.map((param) => {
        const { type, value } = param;

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
            case "string":
            case "bytes":
            default:
                return value;
        }
    });

    return encodeAbiParameters(params, values);
};

export const generateErrorMessage = (param: AbiValueParameter) => {
    const key = `${param.type}-${param.name}`;
    return `[${key}] Invalid ${param.type} value`;
};
