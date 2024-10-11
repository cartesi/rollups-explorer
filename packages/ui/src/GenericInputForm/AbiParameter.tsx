import { useFormContext } from "./context";
import { Button, TextInput, Transition, Paper } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { AbiFunction } from "viem";
import { generateAbiParamFormSpecification } from "./utils";

export const AbiParameter = () => {
    const form = useFormContext();
    const { abiParam, savedAbiParam } = form.getTransformedValues();

    const addABIParam = useCallback(() => {
        form.setFieldValue("savedAbiParam", abiParam);

        const selectedSpecification =
            generateAbiParamFormSpecification(abiParam);

        const nextAbiFunction = (
            selectedSpecification?.abi as AbiFunction[]
        )[0];

        if (nextAbiFunction) {
            const emptyFunctionParams = nextAbiFunction.inputs.map((input) => ({
                ...input,
                value: "",
            }));

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
            {...form.getInputProps("abiParam")}
        />
    );
};
