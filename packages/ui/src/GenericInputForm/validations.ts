import { isAddress, isHex } from "viem";
import {
    AbiFunctionParameterError,
    AbiValueParameter,
    FormValues,
} from "./types";

export const validateApplication = (value: string) =>
    value !== "" && isAddress(value) ? null : "Invalid application";

export const validateHexInput = (value: string) =>
    isHex(value) ? null : "Invalid hex value";

export const validateAbiMethod = (value: string, values: FormValues) =>
    values.mode !== "abi" || value === "new" || value === "existing"
        ? null
        : "Invalid abi method";

export const validateSpecificationId = (value: string, values: FormValues) =>
    values.mode !== "abi" || value !== "" ? null : "Invalid specification";

export const validateAbiFunctionName = (value: string, values: FormValues) =>
    values.mode !== "abi" || value !== "" ? null : "Invalid abi function";

export const validateAbiFunctionParams = (
    value: AbiValueParameter[],
    values: FormValues,
) => {
    if (values.mode !== "abi") {
        return null;
    }

    const errors = value
        .map((param) => {
            const key = `${param.type}-${param.name}`;
            let error: string | null = null;

            switch (param.type) {
                case "uint":
                case "uint8":
                case "uint16":
                case "uint32":
                case "uint64":
                case "uint128":
                case "uint256":
                    try {
                        BigInt(param.value);
                    } catch (e) {
                        error = `[${key}] Invalid uint value`;
                    }
                    break;
                case "string":
                    error =
                        param.value !== ""
                            ? null
                            : `[${key}] Invalid string value`;
                    break;
                case "bool":
                    error =
                        param.value === "true" || param.value === "false"
                            ? null
                            : `[${key}] Invalid boolean value`;
                    break;
                case "bytes":
                    error = isHex(param.value)
                        ? null
                        : `[${key}] Invalid byte value`;
                    break;
                case "address":
                    error = isAddress(param.value)
                        ? null
                        : `[${key}] Invalid address value`;
                    break;
                default:
                    error =
                        param.value !== "" ? null : `[${key}] Invalid value`;
                    break;
            }

            return error;
        })
        .filter((error) => error !== null);

    return errors.length > 0 ? errors : null;
};
