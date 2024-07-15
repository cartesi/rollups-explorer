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
import { useCallback, useState } from "react";

import { notifications } from "@mantine/notifications";
import { isNotNilOrEmpty } from "ramda-adjunct";
import { Abi } from "viem";
import { SpecificationModeInfo } from "./ModeInfo";
import { decodePayload } from "./decoder";
import { SpecFormValues, useSpecFormContext } from "./form/context";
import { ByteSlices, byteSlicesFormActions } from "./form/fields/ByteSlices";
import { Conditions } from "./form/fields/Conditions";
import {
    HumanReadableABI,
    humanReadableABIFormActions,
} from "./form/fields/HumanReadableABI";
import {
    HumanReadableABIParameter,
    humanReadableABIParameterFormActions,
} from "./form/fields/HumanReadableABIParameter";
import { useSpecification } from "./hooks/useSpecification";
import { Modes, Predicate, SliceInstruction, Specification } from "./types";

export const SpecificationForm = () => {
    const [submitting, setSubmitting] = useState(false);
    const { addSpecification } = useSpecification();
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

    const onAbiParamsChange = useCallback(
        (params: string[]) => setFieldValue("abiParams", params),
        [setFieldValue],
    );

    const { errors } = form;

    const onSuccess = (name: string) => {
        notifications.show({
            color: "green",
            title: "Success!",
            message: `Specification ${name} saved!`,
            withBorder: true,
            withCloseButton: true,
        });
        form.reset();
        humanReadableABIFormActions.reset();
        byteSlicesFormActions.reset();
        humanReadableABIParameterFormActions.reset();
    };

    const onFailure = (reason: Error) => {
        notifications.show({
            color: "red",
            title: "Oops!",
            message: reason.message ?? "Something went wrong!",
            withBorder: true,
            withCloseButton: true,
        });
    };

    return (
        <Card shadow="sm" withBorder>
            <form
                onSubmit={form.onSubmit((values) => {
                    const specification = buildSpecification(values);
                    if (form.isValid() && specification !== null) {
                        setSubmitting(true);
                        addSpecification(specification, {
                            onFinished: () => setSubmitting((v) => !v),
                            onSuccess: () => onSuccess(specification.name),
                            onFailure,
                        });
                    } else {
                        form.validate();
                    }
                })}
            >
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
                                    ? { mode, abiParams: [] }
                                    : mode === "abi_params"
                                    ? { mode, abi: undefined }
                                    : { mode };

                            form.setValues(changes);
                        }}
                    />
                    {mode && <SpecificationModeInfo mode={mode} />}
                    {mode === "json_abi" ? (
                        <HumanReadableABI
                            onAbiChange={onAbiChange}
                            error={errors.abi}
                        />
                    ) : mode === "abi_params" ? (
                        <>
                            <HumanReadableABIParameter
                                error={errors.abiParams}
                                onAbiParamsChange={onAbiParamsChange}
                            />
                            <ByteSlices
                                onSliceInstructionsChange={
                                    onSliceInstructionsChange
                                }
                                onSliceTargetChange={onSliceTargetChange}
                                onSwitchChange={onSlicesSwitch}
                                error={errors.sliceInstructions}
                                isActive={transformedValues.sliceInstructionsOn}
                            />
                        </>
                    ) : (
                        <></>
                    )}
                    <Conditions
                        onConditionalsChange={onConditionalsChange}
                        onSwitchChange={onConditionalSwitch}
                        error={errors.conditionals}
                        isActive={transformedValues.conditionalsOn}
                    />
                    <Group justify="flex-end">
                        <Button
                            type="submit"
                            loading={submitting}
                            data-testid="specification-form-save"
                        >
                            Save
                        </Button>
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
