import { useFormContext } from "./context";
import { Button, TextInput } from "@mantine/core";
import { useCallback } from "react";
import { AbiFunction } from "viem";
import {
    generateAbiParamFormSpecification,
    generateInitialValues,
} from "./utils";
import { AbiInputParam } from "./types";
import { isArray } from "ramda-adjunct";

export const AbiParameter = () => {
    const form = useFormContext();
    const { abiParam, savedAbiParam } = form.getTransformedValues();

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
            const emptyFunctionParams: AbiInputParam[] = [];
            (nextAbiFunction.inputs as AbiInputParam[]).forEach((input) => {
                generateInitialValues(input, emptyFunctionParams);
            });

            const prevAbiFunctionParams =
                form.getInputProps("abiFunctionParams");

            if (isArray(prevAbiFunctionParams.value)) {
                prevAbiFunctionParams.value.forEach((_, index) => {
                    form.setFieldError(
                        `abiFunctionParams.${index}.value`,
                        null,
                    );
                });
            }

            form.setFieldValue("abiFunctionParams", emptyFunctionParams);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- 'form' is not added on purpose because it has unstable reference
    }, [abiParam]);

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
