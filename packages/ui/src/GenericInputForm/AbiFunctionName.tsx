import { useFormContext } from "./context";
import { Alert, Combobox, Input, InputBase, useCombobox } from "@mantine/core";
import { AbiFunction } from "viem";
import { useCallback } from "react";
import { FunctionSignature } from "./FunctionSignature";
import { TbAlertCircle } from "react-icons/tb";
import { resetAbiFunctionParams } from "./utils";
import { AbiInputParam, GenericFormAbiFunction } from "./types";

export const AbiFunctionName = () => {
    const form = useFormContext();
    const { abiMethod, abiFunction, selectedSpecification, specificationMode } =
        form.getTransformedValues();
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });
    const specificationFunctions = (
        (selectedSpecification?.abi as GenericFormAbiFunction[]) ?? []
    ).filter((item) => item.type === "function");

    const onChangeAbiFunctionName = useCallback(
        (abiFunctionName: string) => {
            combobox.closeDropdown();
            form.setFieldValue("abiFunctionName", abiFunctionName);

            const nextAbiFunction = (
                (selectedSpecification?.abi as AbiFunction[]) ?? []
            ).find((abiFunction) => abiFunction.name === abiFunctionName);

            if (nextAbiFunction) {
                resetAbiFunctionParams(
                    form,
                    nextAbiFunction.inputs as AbiInputParam[],
                );
            }
        },
        [combobox, form, selectedSpecification],
    );

    return (
        <>
            {(abiMethod === "existing" || specificationMode === "json_abi") &&
                selectedSpecification && (
                    <>
                        {specificationFunctions.length > 0 ? (
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
                                        {...form.getInputProps(
                                            "abiFunctionName",
                                        )}
                                        style={{ overflow: "hidden" }}
                                        onClick={() =>
                                            combobox.toggleDropdown()
                                        }
                                    >
                                        {abiFunction ? (
                                            <FunctionSignature
                                                abiFunction={abiFunction}
                                            />
                                        ) : (
                                            <Input.Placeholder>
                                                Select function
                                            </Input.Placeholder>
                                        )}
                                    </InputBase>
                                </Combobox.Target>

                                <Combobox.Dropdown>
                                    <Combobox.Options>
                                        {specificationFunctions.map(
                                            (abiFunction) => {
                                                const params =
                                                    abiFunction.inputs
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
                                                            abiFunction={
                                                                abiFunction
                                                            }
                                                        />
                                                    </Combobox.Option>
                                                );
                                            },
                                        )}
                                    </Combobox.Options>
                                </Combobox.Dropdown>
                            </Combobox>
                        ) : (
                            <Alert
                                variant="light"
                                color="blue"
                                icon={<TbAlertCircle />}
                                data-testid="no-functions-alert"
                            >
                                No ABI functions available for this
                                specification.
                            </Alert>
                        )}
                    </>
                )}
        </>
    );
};
