import { FormValues } from "./types";

export const initialValues: FormValues = {
    mode: "hex",
    application: "",
    rawInput: "0x",
    stringInput: "",
    abiMethod: "existing",
    specificationMode: "json_abi",
    humanAbi: "",
    specificationId: "",
    abiFunctionName: "",
    abiFunctionParams: [],
};
