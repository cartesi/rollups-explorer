import { useForm } from "./context";
import { initialValues } from "./initialValues";
import {
    validateAbiFunctionName,
    validateAbiFunctionParamValue,
    validateAbiMethod,
    validateApplication,
    validateHexInput,
    validateSpecificationId,
} from "./validations";
import { AbiFunction, getAddress, Hex, isAddress, zeroAddress } from "viem";
import { FormSpecification } from "./types";

export const useGenericInputForm = (specifications: FormSpecification[]) => {
    return useForm({
        validateInputOnBlur: true,
        initialValues,
        validate: {
            application: validateApplication,
            rawInput: validateHexInput,
            abiMethod: validateAbiMethod,
            specificationId: validateSpecificationId,
            abiFunctionName: validateAbiFunctionName,
            abiFunctionParams: {
                value: validateAbiFunctionParamValue,
            },
        },
        transformValues: (values) => {
            const selectedSpecification = specifications.find(
                (s) => s.id === values.specificationId,
            );

            return {
                mode: values.mode,
                address: isAddress(values.application)
                    ? getAddress(values.application)
                    : zeroAddress,
                rawInput: values.rawInput as Hex,
                abiMethod: values.abiMethod,
                specificationId: values.specificationId,
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
