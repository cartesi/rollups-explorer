import { useFormContext } from "./context";
import {
    Alert,
    Box,
    Combobox,
    Flex,
    Group,
    Input,
    InputBase,
    SegmentedControl,
    Select,
    Stack,
    Text,
    Textarea,
    TextInput,
    Tooltip,
    useCombobox,
} from "@mantine/core";
import { AbiFunction, AbiParameter } from "viem";
import { FC, Fragment, useCallback, useEffect } from "react";
import {
    AbiValueParameter,
    FormAbiMethod,
    FormSpecification,
    SpecificationMode,
} from "./types";
import { TbAlertCircle, TbHelp } from "react-icons/tb";
import { encodeFunctionParams } from "./utils";
import { useDebouncedCallback } from "@mantine/hooks";
import LabelWithTooltip from "web/src/components/labelWithTooltip";
import { AbiFunctionNameCombobox } from "./AbiFunctionNameCombobox";

const placeholder = `function balanceOf(address owner) view returns (uint256) \nevent Transfer(address indexed from, address indexed to, uint256 amount)`;

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
    const { abiMethod, abiFunction, specificationMode, selectedSpecification } =
        form.getTransformedValues();
    const abiFunctionParams = form.getInputProps("abiFunctionParams");
    const isFormValid = form.isValid();
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

    const onChangeHumanAbiDebounced = useDebouncedCallback(() => {}, 400);

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

            {abiMethod === "new" ? (
                <Stack>
                    <SegmentedControl
                        aria-label="Specification Mode"
                        data={[
                            {
                                label: "JSON ABI",
                                value: "json_abi",
                            },
                            {
                                label: "ABI Parameters",
                                value: "abi_params",
                            },
                        ]}
                        {...form.getInputProps("specificationMode")}
                        onChange={(nextValue) => {
                            form.setFieldValue(
                                "specificationMode",
                                nextValue as SpecificationMode,
                            );
                        }}
                    />

                    {specificationMode === "json_abi" ? (
                        <Textarea
                            data-testid="json-abi-textarea"
                            resize="vertical"
                            description="Define signatures in Human readable format"
                            placeholder={placeholder}
                            rows={5}
                            label={
                                <Group justify="flex-start" gap="3">
                                    <Text size="sm">ABI</Text>
                                    <Tooltip
                                        multiline
                                        label="Define the signature without wrapping it on quotes nor adding comma at the end to separate. Just hit enter and keep defining your signatures"
                                        withArrow
                                        w="300"
                                    >
                                        <Flex direction="column-reverse">
                                            <TbHelp />
                                        </Flex>
                                    </Tooltip>
                                </Group>
                            }
                            {...form.getInputProps("humanAbi")}
                            onChange={(event) => {
                                const nextValue = event.target.value;
                                form.setFieldValue("humanAbi", nextValue);
                            }}
                        />
                    ) : null}
                </Stack>
            ) : (
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
            )}

            <AbiFunctionNameCombobox />

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
