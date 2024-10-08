import { isAddress, isHex } from "viem";
import { FormValues } from "./types";

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
