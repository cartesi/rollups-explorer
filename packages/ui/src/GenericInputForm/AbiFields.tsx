import { useFormContext } from "./context";
import {
    Flex,
    Group,
    SegmentedControl,
    Select,
    Stack,
    Text,
    Textarea,
    Tooltip,
} from "@mantine/core";
import { FC } from "react";
import { FormAbiMethod, FormSpecification, SpecificationMode } from "./types";
import { TbHelp } from "react-icons/tb";
import { AbiFunctionName } from "./AbiFunctionName";
import { AbiFunctionParams } from "./AbiFunctionParams";
import { AbiParameter } from "./AbiParameter";

export interface AbiFieldsProps {
    specifications: FormSpecification[];
}

export const AbiFields: FC<AbiFieldsProps> = ({ specifications }) => {
    const form = useFormContext();
    const { abiMethod, specificationMode } = form.getTransformedValues();
    const specificationOptions = specifications.map((s) => ({
        value: s.id,
        label: s.name,
    }));

    return (
        <>
            <Select
                label="ABI method"
                description="Select how to attach an ABI"
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
                    form.setFieldValue("humanAbi", "");
                    form.setFieldValue("abiParam", "");
                    form.setFieldValue("savedAbiParam", "");
                    form.setFieldValue("specificationMode", "json_abi");
                }}
            />

            {abiMethod === "new" ? (
                <>
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

                            form.setFieldValue("specificationId", "");
                            form.setFieldValue("abiFunctionName", "");
                            form.setFieldValue("abiFunctionParams", []);
                            form.setFieldValue("humanAbi", "");
                            form.setFieldValue("abiParam", "");
                            form.setFieldValue("savedAbiParam", "");
                        }}
                    />

                    {specificationMode === "json_abi" ? (
                        <Textarea
                            data-testid="json-abi-textarea"
                            resize="vertical"
                            description="Define signatures in Human readable format"
                            placeholder="function balanceOf(address owner) view returns (uint256) event Transfer(address indexed from, address indexed to, uint256 amount)"
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
                                form.validateField("humanAbi");
                            }}
                        />
                    ) : (
                        <AbiParameter />
                    )}
                </>
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

            <AbiFunctionName />
            <AbiFunctionParams />
        </>
    );
};
