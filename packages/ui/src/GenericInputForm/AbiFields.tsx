import { useFormContext } from "./context";
import {
    Alert,
    Box,
    Combobox,
    Input,
    InputBase,
    Select,
    Stack,
    Text,
    TextInput,
    useCombobox,
} from "@mantine/core";
import { AbiFunction, AbiParameter } from "viem";
import { FC, Fragment, useCallback, useEffect } from "react";
import { AbiValueParameter, FormAbiMethod, FormSpecification } from "./types";
import { TbAlertCircle } from "react-icons/tb";
import { encodeFunctionParams } from "./utils";
import { useDebouncedCallback } from "@mantine/hooks";

interface FunctionParamLabelProps {
    input: AbiParameter;
}

export const FunctionParamLabel: FC<FunctionParamLabelProps> = ({ input }) => {
    return (
        <Box display="inline">
            <Text c="cyan" span fz="sm">
                {input.type}
            </Text>{" "}
            <Text span fz="sm">
                {input.name}
            </Text>
        </Box>
    );
};

interface FunctionSignatureProps {
    abiFunction: AbiFunction;
}

export const FunctionSignature: FC<FunctionSignatureProps> = ({
    abiFunction,
}) => {
    return (
        <>
            <Text span fw="bold" fz="sm">
                {abiFunction.name}
            </Text>
            (
            {abiFunction.inputs.map((input, index) => (
                <Fragment key={`${input.type}-${input.name}`}>
                    <FunctionParamLabel input={input} />
                    {index < abiFunction.inputs.length - 1 ? ", " : ""}
                </Fragment>
            ))}
            )
        </>
    );
};

export interface AbiFieldsProps {
    specifications: FormSpecification[];
}

export const AbiFields: FC<AbiFieldsProps> = ({ specifications }) => {
    const form = useFormContext();
    const { abiMethod, abiFunction, specificationId } =
        form.getTransformedValues();
    const abiFunctionParams = form.getInputProps("abiFunctionParams");
    const isFormValid = form.isValid();
    const selectedSpecification = specifications.find(
        (s) => s.id === specificationId,
    );
    const specificationOptions = specifications.map((s) => ({
        value: s.id,
        label: s.name,
    }));
    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

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

    const encodeFunctionParamsDebounced = useDebouncedCallback(
        (params: AbiValueParameter[]) => {
            // Encode the function params
            const payload = encodeFunctionParams(params);
            // Set the encoded function params as value for hex field
            form.setFieldValue("rawInput", payload);
        },
        400,
    );

    useEffect(() => {
        if (isFormValid) {
            encodeFunctionParamsDebounced(abiFunctionParams.value);
        }
    }, [abiFunctionParams.value, isFormValid, encodeFunctionParamsDebounced]);

    return (
        <Stack>
            <Select
                label="ABI method"
                description="Select how to attach an ABI"
                mb={16}
                allowDeselect={false}
                withAsterisk
                data={[
                    {
                        value: "existing",
                        label: "ABI from an existing JSON_ABI specification",
                    },
                    { value: "new", label: "New ABI" },
                ]}
                {...form.getInputProps("abiMethod")}
                onChange={(nextValue) => {
                    form.setFieldValue("abiMethod", nextValue as FormAbiMethod);
                    form.setFieldValue("specificationId", "");
                    form.setFieldValue("abiFunctionName", "");
                    form.setFieldValue("abiFunctionParams", []);
                }}
            />

            {abiMethod === "existing" ? (
                <Select
                    label="Specifications"
                    description="Available JSON_ABI specifications"
                    placeholder="Select specification"
                    data={specificationOptions}
                    allowDeselect={false}
                    withAsterisk
                    {...form.getInputProps("specificationId")}
                    onChange={(nextValue) => {
                        form.setFieldValue(
                            "specificationId",
                            nextValue as string,
                        );
                        form.setFieldValue("abiFunctionName", "");
                        form.setFieldValue("abiFunctionParams", []);
                    }}
                />
            ) : null}

            {selectedSpecification && (
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
                            {(selectedSpecification.abi as AbiFunction[])
                                .filter((item) => item.type === "function")
                                .map((abiFunction) => {
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
            )}

            {abiFunction && (
                <Stack>
                    {abiFunction.inputs.length > 0 ? (
                        <>
                            {abiFunction.inputs.map((input, index) => (
                                <TextInput
                                    key={`${input.name}-${input.type}`}
                                    label={
                                        input.name && input.type ? (
                                            <FunctionParamLabel input={input} />
                                        ) : (
                                            input.name || input.type
                                        )
                                    }
                                    placeholder={`Enter ${input.type} value`}
                                    withAsterisk
                                    {...form.getInputProps(
                                        `abiFunctionParams.${index}.value`,
                                    )}
                                />
                            ))}
                        </>
                    ) : (
                        <Alert
                            variant="light"
                            color="blue"
                            icon={<TbAlertCircle />}
                            data-testid="empty-inputs-argments-alert"
                        >
                            No input arguments defined for{" "}
                            <Text span fz="sm" fw="bold">
                                {abiFunction.name}()
                            </Text>
                            .
                        </Alert>
                    )}
                </Stack>
            )}
        </Stack>
    );
};
