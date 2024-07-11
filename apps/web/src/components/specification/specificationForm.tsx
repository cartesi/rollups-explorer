import {
    Alert,
    Anchor,
    Box,
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
import { FC, ReactNode, useCallback, useEffect } from "react";
import { TbAlertCircle, TbExternalLink } from "react-icons/tb";

import { isNotNilOrEmpty } from "ramda-adjunct";
import { Abi } from "viem";
import { decodePayload } from "./decoder";
import { SpecTransformedValues, useSpecFormContext } from "./formContext";
import { ByteSlices } from "./forms/ByteSlices";
import { Conditions } from "./forms/Conditions";
import { HumanReadableABI } from "./forms/HumanReadableABI";
import { HumanReadableABIParameter } from "./forms/HumanReadableABIParameter";
import { Modes, Predicate, SliceInstruction, Specification } from "./types";

const modeInfo: Record<Modes, ReactNode> = {
    json_abi: (
        <Text>
            Use human readable ABI format to generate a full fledged JSON-ABI
            and decode standard ABI encoded data (i.e. 4 byte selector &
            arguments).{" "}
            <Anchor href="https://abitype.dev/api/human" target="_blank">
                <Group gap={2} component="span">
                    Human-readable ABI
                    <Box component="span" pt="4px">
                        <TbExternalLink />
                    </Box>
                </Group>
            </Anchor>
        </Text>
    ),
    abi_params: (
        <Text>
            The set of ABI parameters to decode against data, in the shape of
            the inputs or outputs attribute of an ABI event/function. These
            parameters must include valid{" "}
            <Anchor
                href="https://docs.soliditylang.org/en/v0.8.25/abi-spec.html#types"
                target="blank"
            >
                <Group gap={2} component="span">
                    ABI types
                    <Box component="span" pt="4px">
                        <TbExternalLink />
                    </Box>
                </Group>
            </Anchor>
        </Text>
    ),
};

const Info: FC<{ mode: Modes }> = ({ mode }) => {
    return (
        <Alert variant="light" color="blue" icon={<TbAlertCircle />}>
            {modeInfo[mode]}
        </Alert>
    );
};

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
            <Stack>
                <TextInput
                    label="Name"
                    description="Specification name for ease identification"
                    placeholder="My Spec name"
                    {...form.getInputProps("name")}
                    onChange={(event) => {
                        const entry = event.target.value;
                        form.setFieldValue("name", entry);
                    }}
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
                <Info mode={mode} />
                <Stack>
                    {mode === "json_abi" ? (
                        <HumanReadableABI onAbiChange={onAbiChange} />
                    ) : mode === "abi_params" ? (
                        <>
                            <HumanReadableABIParameter />
                            <ByteSlices
                                onSliceInstructionsChange={
                                    onSliceInstructionsChange
                                }
                                onSliceTargetChange={onSliceTargetChange}
                                onSwitchChange={onSlicesSwitch}
                            />
                        </>
                    ) : (
                        <></>
                    )}
                    <Conditions
                        onConditionalsChange={onConditionalsChange}
                        onSwitchChange={onConditionalSwitch}
                    />
                </Stack>
            </Stack>
        </Card>
    );
};

const replacerForBigInt = (key: any, value: any) => {
    return typeof value === "bigint" ? value.toString() : value;
};

const stringifyContent = (value: Record<string, any>): string => {
    return JSON.stringify(value, replacerForBigInt, 2);
};

const buildSpecification = (
    values: SpecTransformedValues,
): Specification | null => {
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
