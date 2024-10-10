import { useForm } from "./context";
import {
    validateAbiFunctionName,
    validateAbiFunctionParamValue,
    validateAbiMethod,
    validateApplication,
    validateHexInput,
    validateHumanAbi,
    validateSpecificationId,
} from "./validations";
import { AbiFunction, getAddress, Hex, isAddress, zeroAddress } from "viem";
import { FormSpecification } from "./types";
import { generateFormSpecification } from "./utils";

export const useGenericInputForm = (specifications: FormSpecification[]) => {
    return useForm({
        validateInputOnBlur: true,
        initialValues: {
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
        },
        validate: {
            application: validateApplication,
            rawInput: validateHexInput,
            abiMethod: validateAbiMethod,
            humanAbi: validateHumanAbi,
            specificationId: validateSpecificationId,
            abiFunctionName: validateAbiFunctionName,
            abiFunctionParams: {
                value: validateAbiFunctionParamValue,
            },
        },
        transformValues: (values) => {
            const selectedSpecification =
                values.abiMethod === "existing"
                    ? specifications.find(
                          (s) => s.id === values.specificationId,
                      )
                    : values.specificationMode === "json_abi"
                    ? generateFormSpecification(values.humanAbi)
                    : undefined;

            return {
                mode: values.mode,
                address: isAddress(values.application)
                    ? getAddress(values.application)
                    : zeroAddress,
                rawInput: values.rawInput as Hex,
                abiMethod: values.abiMethod,
                specificationMode: values.specificationMode,
                humanAbi: values.humanAbi,
                specificationId: values.specificationId,
                selectedSpecification,
                abiFunction: (
                    (selectedSpecification?.abi as AbiFunction[]) ?? []
                ).find(
                    (abiFunction) =>
                        abiFunction.name === values.abiFunctionName,
                ),
            };
        },
    });
};
