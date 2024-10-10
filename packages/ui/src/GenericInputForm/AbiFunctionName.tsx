import { useFormContext } from "./context";
import { Combobox, Input, InputBase, useCombobox } from "@mantine/core";
import { AbiFunction } from "viem";
import { useCallback } from "react";
import { FunctionSignature } from "./FunctionSignature";

export const AbiFunctionName = () => {
    const form = useFormContext();
    const { abiFunction, selectedSpecification } = form.getTransformedValues();
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const specificationFunctions = (
        (selectedSpecification?.abi as AbiFunction[]) ?? []
    ).filter((item) => item.type === "function");

    const onChangeAbiFunctionName = useCallback(
        (abiFunctionName: string) => {
            combobox.closeDropdown();

            form.setFieldValue("abiFunctionName", abiFunctionName);

            const nextAbiFunction = (
                (selectedSpecification?.abi as AbiFunction[]) ?? []
            ).find((abiFunction) => abiFunction.name === abiFunctionName);

            if (nextAbiFunction) {
                const emptyFunctionParams = nextAbiFunction.inputs.map(
                    (input) => ({
                        ...input,
                        value: "",
                    }),
                );

                form.setFieldValue("abiFunctionParams", emptyFunctionParams);
            }
        },
        [combobox, form, selectedSpecification],
    );

    return (
        <>
            {selectedSpecification && specificationFunctions.length > 0 ? (
                <Combobox
                    store={combobox}
                    onOptionSubmit={onChangeAbiFunctionName}
                >
                    <Combobox.Target>
                        <InputBase
                            component="button"
                            type="button"
                            pointer
                            label="ABI Function"
                            description="Available ABI functions"
                            rightSection={<Combobox.Chevron />}
                            rightSectionPointerEvents="none"
                            withAsterisk
                            {...form.getInputProps("abiFunctionName")}
                            onClick={() => combobox.toggleDropdown()}
                        >
                            {abiFunction ? (
                                <FunctionSignature abiFunction={abiFunction} />
                            ) : (
                                <Input.Placeholder>
                                    Select function
                                </Input.Placeholder>
                            )}
                        </InputBase>
                    </Combobox.Target>

                    <Combobox.Dropdown>
                        <Combobox.Options>
                            {specificationFunctions.map((abiFunction) => {
                                const params = abiFunction.inputs
                                    .map(
                                        (input) =>
                                            `${input.type} ${input.name}`,
                                    )
                                    .join(", ");

                                return (
                                    <Combobox.Option
                                        key={`${abiFunction.name}-${params}`}
                                        value={abiFunction.name}
                                    >
                                        <FunctionSignature
                                            abiFunction={abiFunction}
                                        />
                                    </Combobox.Option>
                                );
                            })}
                        </Combobox.Options>
                    </Combobox.Dropdown>
                </Combobox>
            ) : null}
        </>
    );
};
