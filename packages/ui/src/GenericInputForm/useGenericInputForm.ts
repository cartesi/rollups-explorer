import { useForm } from "./context";
import {
    validateAbiFunctionName,
    validateAbiFunctionParamValue,
    validateAbiMethod,
    validateAbiParam,
    validateApplication,
    validateHexInput,
    validateHumanAbi,
    validateSpecificationId,
} from "./validations";
import { AbiFunction, getAddress, Hex, isAddress, zeroAddress } from "viem";
import { FormSpecification } from "./types";
import {
    generateAbiParamFormSpecification,
    generateHumanAbiFormSpecification,
} from "./utils";
import { initialValues } from "./initialValues";

export const useGenericInputForm = (specifications: FormSpecification[]) => {
    return useForm({
        validateInputOnBlur: true,
        initialValues,
        validate: {
            application: validateApplication,
            rawInput: validateHexInput,
            abiMethod: validateAbiMethod,
            humanAbi: validateHumanAbi,
            abiParam: validateAbiParam,
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
                    ? generateHumanAbiFormSpecification(values.humanAbi)
                    : generateAbiParamFormSpecification(values.savedAbiParam);

            return {
                mode: values.mode,
                address: isAddress(values.application)
                    ? getAddress(values.application)
                    : zeroAddress,
                rawInput: values.rawInput as Hex,
                abiMethod: values.abiMethod,
                specificationMode: values.specificationMode,
                humanAbi: values.humanAbi,
                abiParam: values.abiParam,
                savedAbiParam: values.savedAbiParam,
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
