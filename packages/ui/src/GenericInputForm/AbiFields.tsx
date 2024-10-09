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
import { FC, Fragment, useCallback, useEffect, useState } from "react";
import { AbiValueParameter, FormAbiMethod, FormSpecification } from "./types";
import { TbAlertCircle } from "react-icons/tb";
import { encodeFunctionParams } from "./utils";

interface FunctionParamProps {
    input: AbiParameter;
}

export const FunctionParam: FC<FunctionParamProps> = ({ input }) => {
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
                    <FunctionParam input={input} />
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
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>(
        {},
    );
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
            setTouchedFields({});

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

    const isFormValid = form.isValid();
    useEffect(() => {
        if (isFormValid) {
            const payload = encodeFunctionParams(abiFunctionParams.value);
            form.setFieldValue("rawInput", payload);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- 'form' dependency is not added on purpose because it has an unstable reference
    }, [abiFunctionParams.value, isFormValid]);

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
                            {abiFunction.inputs.map((input) => {
                                const abiFunctionParamsValue =
                                    abiFunctionParams.value as AbiValueParameter[];
                                const param = abiFunctionParamsValue.find(
                                    (p) =>
                                        p.type === input.type &&
                                        p.name === input.name,
                                ) as AbiValueParameter;
                                const fieldKey = `[${param.type}-${param.name}]`;
                                const error = abiFunctionParams.error?.find(
                                    (error: string | null) =>
                                        error?.includes(fieldKey),
                                );
                                const errorMessage = error
                                    ? error.replace(fieldKey, "")
                                    : null;

                                return (
                                    <TextInput
                                        key={`${input.name}-${input.type}`}
                                        value={param.value}
                                        label={
                                            input.name && input.type ? (
                                                <FunctionParam input={input} />
                                            ) : (
                                                input.name || input.type
                                            )
                                        }
                                        placeholder={`Enter ${input.type} value`}
                                        withAsterisk
                                        error={
                                            touchedFields[fieldKey] &&
                                            errorMessage
                                                ? errorMessage
                                                : null
                                        }
                                        onBlur={() => {
                                            form.validateField(
                                                "abiFunctionParams",
                                            );

                                            setTouchedFields(
                                                (touchedFields) => ({
                                                    ...touchedFields,
                                                    [fieldKey]: true,
                                                }),
                                            );
                                        }}
                                        onChange={(event) => {
                                            const nextValue =
                                                event.target.value;
                                            const nextAbiFunctionParams =
                                                abiFunctionParamsValue.map(
                                                    (p) =>
                                                        p.type === input.type &&
                                                        p.name === input.name
                                                            ? {
                                                                  ...p,
                                                                  value: nextValue,
                                                              }
                                                            : p,
                                                );

                                            form.setFieldValue(
                                                "abiFunctionParams",
                                                nextAbiFunctionParams,
                                            );
                                        }}
                                    />
                                );
                            })}
                        </>
                    ) : (
                        <Alert
                            variant="light"
                            color="blue"
                            icon={<TbAlertCircle />}
                            data-testid={`specification-mode-info`}
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
