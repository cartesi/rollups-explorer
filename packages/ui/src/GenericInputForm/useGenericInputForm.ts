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
import { FormSpecification, GenericFormAbiFunction } from "./types";
import {
    augmentInputsWithIds,
    generateAbiParamFormSpecification,
    generateHumanAbiFormSpecification,
} from "./utils";
import { initialValues } from "./initialValues";
import { v4 as uuidv4 } from "uuid";
import { useRef } from "react";
import { equals, omit } from "ramda";

export const useGenericInputForm = (specifications: FormSpecification[]) => {
    const lastSelectedSpecification = useRef<FormSpecification | undefined>(
        undefined,
    );
    const lastSelectedSpecificationWithIds = useRef<
        FormSpecification | undefined
    >(undefined);

    return useForm({
        validateInputOnBlur: true,
        initialValues: {
            ...initialValues,
            abiMethod: specifications.length > 0 ? "existing" : "new",
        },
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
            let selectedSpecification =
                values.abiMethod === "existing"
                    ? specifications.find(
                          (s) => s.id === values.specificationId,
                      )
                    : values.specificationMode === "json_abi"
                    ? generateHumanAbiFormSpecification(values.humanAbi)
                    : generateAbiParamFormSpecification(values.savedAbiParam);

            if (
                selectedSpecification &&
                !equals(
                    omit(["id"], selectedSpecification),
                    omit(
                        ["id"],
                        (lastSelectedSpecification.current ??
                            {}) as FormSpecification,
                    ),
                )
            ) {
                lastSelectedSpecification.current = {
                    ...selectedSpecification,
                };

                const selectedSpecificationWithIds = {
                    ...selectedSpecification,
                    abi: selectedSpecification.abi.map((abiFunction) => {
                        const nextAbiFunction = {
                            ...abiFunction,
                        } as GenericFormAbiFunction;

                        nextAbiFunction.inputs = nextAbiFunction.inputs.map(
                            (input) => {
                                const nextInput = { ...input, id: uuidv4() };

                                if (nextInput.type === "tuple") {
                                    nextInput.components =
                                        augmentInputsWithIds(nextInput);
                                }

                                return nextInput;
                            },
                        );

                        return nextAbiFunction;
                    }),
                };

                selectedSpecification = { ...selectedSpecificationWithIds };
                lastSelectedSpecificationWithIds.current = {
                    ...selectedSpecificationWithIds,
                };
            } else if (lastSelectedSpecificationWithIds.current) {
                selectedSpecification = {
                    ...lastSelectedSpecificationWithIds.current,
                };
            }

            const abiFunction = (
                (selectedSpecification?.abi as AbiFunction[]) ?? []
            ).find(
                (abiFunction) => abiFunction.name === values.abiFunctionName,
            ) as GenericFormAbiFunction;

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
                abiFunctionName: values.abiFunctionName,
                selectedSpecification,
                abiFunction,
            };
        },
    });
};
