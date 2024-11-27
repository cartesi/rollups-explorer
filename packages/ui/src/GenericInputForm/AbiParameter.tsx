import { useFormContext } from "./context";
import { Button, TextInput } from "@mantine/core";
import { useCallback, useEffect, useRef } from "react";
import { AbiFunction } from "viem";
import {
    generateAbiParamFormSpecification,
    resetAbiFunctionParams,
} from "./utils";
import { AbiInputParam } from "./types";

export const AbiParameter = () => {
    const form = useFormContext();
    const { abiParam, savedAbiParam, specificationId, selectedSpecification } =
        form.getTransformedValues();
    const lastSpecificationId = useRef(specificationId);

    const addABIParam = useCallback(() => {
        form.setFieldValue("savedAbiParam", abiParam);
        const selectedSpecification =
            generateAbiParamFormSpecification(abiParam);

        if (selectedSpecification) {
            form.setFieldValue("specificationId", selectedSpecification.id);
        }

        const nextAbiFunction = (
            selectedSpecification?.abi as AbiFunction[]
        )[0];

        if (nextAbiFunction) {
            resetAbiFunctionParams(
                form,
                nextAbiFunction.inputs as AbiInputParam[],
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- 'form' is not added on purpose because it has unstable reference
    }, [abiParam]);

    useEffect(() => {
        if (specificationId !== lastSpecificationId.current) {
            lastSpecificationId.current = specificationId;

            const nextAbiFunction = (
                selectedSpecification?.abi as AbiFunction[]
            )[0];

            if (nextAbiFunction) {
                resetAbiFunctionParams(
                    form,
                    nextAbiFunction.inputs as AbiInputParam[],
                );
            }
        }
    }, [form, selectedSpecification?.abi, specificationId]);

    return (
        <TextInput
            label="ABI Parameter"
            description="Human readable ABI format"
            placeholder="address to, uint256 amount, bool succ"
            rightSectionWidth="lg"
            rightSection={
                <Button
                    data-testid="abi-parameter-add-button"
                    onClick={addABIParam}
                    disabled={
                        !!form.errors.abiParam || abiParam === savedAbiParam
                    }
                >
                    Save
                </Button>
            }
            data-testid="abi-parameter-input"
            {...form.getInputProps("abiParam")}
            onChange={(event) => {
                const nextValue = event.target.value;
                form.setFieldValue("abiParam", nextValue);
                form.validateField("abiParam");
            }}
        />
    );
};
