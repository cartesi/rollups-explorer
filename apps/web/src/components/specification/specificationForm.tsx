import {
    Alert,
    Button,
    Card,
    Code,
    Group,
    JsonInput,
    SegmentedControl,
    Stack,
    Text,
    TextInput,
    Textarea,
    Title,
} from "@mantine/core";
import { useCallback, useEffect } from "react";

import { isNotNilOrEmpty } from "ramda-adjunct";
import { Abi } from "viem";
import { SpecificationModeInfo } from "./ModeInfo";
import { decodePayload } from "./decoder";
import { SpecFormValues, useSpecFormContext } from "./form/context";
import { ByteSlices } from "./form/fields/ByteSlices";
import { Conditions } from "./form/fields/Conditions";
import { HumanReadableABI } from "./form/fields/HumanReadableABI";
import { HumanReadableABIParameter } from "./form/fields/HumanReadableABIParameter";
import { Modes, Predicate, SliceInstruction, Specification } from "./types";

export const SpecificationForm = () => {
    const form = useSpecFormContext();
    const transformedValues = form.getTransformedValues();
    const { mode } = transformedValues;
    const { setFieldValue } = form;

    const onAbiChange = useCallback(
        (abi: Abi) => {
            setFieldValue("abi", abi);
        },
        [setFieldValue],
    );

    const onConditionalsChange = useCallback(
        (conditionals: Predicate[]) => {
            setFieldValue("conditionals", conditionals);
        },
        [setFieldValue],
    );

    const onConditionalSwitch = useCallback(
        (active: boolean) => {
            setFieldValue("conditionalsOn", active);
        },
        [setFieldValue],
    );

    const onSlicesSwitch = useCallback(
        (active: boolean) => {
            setFieldValue("sliceInstructionsOn", active);
        },
        [setFieldValue],
    );

    const onSliceInstructionsChange = useCallback(
        (slices: SliceInstruction[]) =>
            setFieldValue("sliceInstructions", slices),
        [setFieldValue],
    );

    const onSliceTargetChange = useCallback(
        (target?: string) => setFieldValue("sliceTarget", target),
        [setFieldValue],
    );

    const { errors } = form;

    useEffect(() => {
        mode === "json_abi"
            ? form.setFieldValue("abiParamEntry", "")
            : mode === "abi_params"
            ? form.setFieldValue("abi", undefined)
            : null;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    return (
        <Card shadow="sm" withBorder>
            <form>
                <Stack>
                    <TextInput
                        label="Name"
                        description="Specification name for ease identification"
                        placeholder="My Spec name"
                        withAsterisk
                        {...form.getInputProps("name")}
                    />

                    <SegmentedControl
                        aria-labelledby="specification-mode-label"
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
                        {...form.getInputProps("mode")}
                        onChange={(value) => {
                            const mode = value as Modes;
                            const changes =
                                mode === "json_abi"
                                    ? { mode, abiParamEntry: "" }
                                    : mode === "abi_params"
                                    ? { mode, abi: undefined }
                                    : { mode };

                            form.setValues(changes);
                        }}
                    />
                    <SpecificationModeInfo mode={mode} />
                    {mode === "json_abi" ? (
                        <HumanReadableABI
                            onAbiChange={onAbiChange}
                            error={errors.abi}
                        />
                    ) : mode === "abi_params" ? (
                        <>
                            <HumanReadableABIParameter
                                error={errors.abiParams}
                            />
                            <ByteSlices
                                onSliceInstructionsChange={
                                    onSliceInstructionsChange
                                }
                                onSliceTargetChange={onSliceTargetChange}
                                onSwitchChange={onSlicesSwitch}
                                error={errors.sliceInstructions}
                            />
                        </>
                    ) : (
                        <></>
                    )}
                    <Conditions
                        onConditionalsChange={onConditionalsChange}
                        onSwitchChange={onConditionalSwitch}
                        error={errors.conditionals}
                    />
                    <Group justify="flex-end">
                        <Button onClick={() => form.validate()}>Save</Button>
                    </Group>
                </Stack>
            </form>
        </Card>
    );
};

const replacerForBigInt = (key: any, value: any) => {
    return typeof value === "bigint" ? value.toString() : value;
};

const stringifyContent = (value: Record<string, any>): string => {
    return JSON.stringify(value, replacerForBigInt, 2);
};

const buildSpecification = (values: SpecFormValues): Specification | null => {
    const {
        mode,
        name,
        sliceInstructions,
        abi,
        abiParams,
        conditionals,
        sliceTarget,
    } = values;
    const version = 1;
    const timestamp = Date.now();
    const commons = { conditionals, timestamp, version, name };

    if (
        mode === "abi_params" &&
        (isNotNilOrEmpty(abiParams) || isNotNilOrEmpty(sliceInstructions))
    ) {
        return {
            ...commons,
            mode,
            abiParams,
            sliceInstructions:
                sliceInstructions.length > 0 ? sliceInstructions : undefined,
            sliceTarget: sliceTarget,
        } as Specification;
    } else if (mode === "json_abi" && isNotNilOrEmpty(abi)) {
        return {
            ...commons,
            mode,
            abi,
        } as Specification;
    }

    return null;
};

export const DecodingPreview = () => {
    const form = useSpecFormContext();
    const values = form.getTransformedValues();
    const { encodedData } = values;
    const tempSpec = buildSpecification(values);
    const envelope =
        tempSpec && encodedData ? decodePayload(tempSpec, encodedData) : null;
    const content = envelope?.result ? stringifyContent(envelope.result) : null;

    return (
        <Card shadow="sm" withBorder>
            <Title order={3}>Preview</Title>
            <Stack gap="lg">
                <Textarea
                    resize="vertical"
                    rows={5}
                    label="Data"
                    id="encoded-data-preview"
                    description="Encoded data to test against specification"
                    {...form.getInputProps("encodedData")}
                />

                {content && (
                    <Code>
                        <JsonInput
                            value={`${content}`}
                            variant="transparent"
                            autosize
                            readOnly
                        />
                    </Code>
                )}

                {envelope?.error && (
                    <Alert
                        color="yellow"
                        title="Keep changing your specification"
                    >
                        <Text style={{ whiteSpace: "pre-line" }}>
                            {envelope.error.message}
                        </Text>
                    </Alert>
                )}
            </Stack>
        </Card>
    );
};
