import {
    Button,
    Card,
    Group,
    SegmentedControl,
    Stack,
    TextInput,
} from "@mantine/core";
import { FC, useCallback, useEffect, useRef, useState } from "react";

import { useScrollIntoView } from "@mantine/hooks";
import { formatAbi } from "abitype";
import { clone, pathOr, propOr } from "ramda";
import { isFunction, isNotNilOrEmpty } from "ramda-adjunct";
import { Abi } from "viem";
import { SpecificationModeInfo } from "../components/ModeInfo";
import { useSpecification } from "../hooks/useSpecification";
import { Modes, Predicate, SliceInstruction, Specification } from "../types";
import { buildSpecification } from "../utils";
import { SpecFormValues, useSpecFormContext } from "./context";
import { ByteSlices, byteSlicesFormActions } from "./fields/ByteSlices";
import { Conditions, conditionsFormActions } from "./fields/Conditions";
import {
    HumanReadableABI,
    humanReadableABIFormActions,
} from "./fields/HumanReadableABI";
import {
    HumanReadableABIParameter,
    humanReadableABIParameterFormActions,
} from "./fields/HumanReadableABIParameter";

const editModeStartup = (transformedValues: SpecFormValues) => {
    humanReadableABIFormActions.setFieldValue(
        "humanABIEntry",
        formatAbi(transformedValues.abi ?? []).join("\n"),
    );
    humanReadableABIParameterFormActions.setFieldValue(
        "entries",
        transformedValues.abiParams,
    );

    byteSlicesFormActions.setValues((prev) => {
        return {
            slices: propOr(prev.slices, "sliceInstructions", transformedValues),
            sliceTarget: propOr(
                prev.sliceTarget,
                "sliceTarget",
                transformedValues,
            ),
            sliceTargetChecked: isNotNilOrEmpty(transformedValues.sliceTarget),
        };
    });

    conditionsFormActions.setValues((prev) => ({
        conditions: pathOr(
            prev.conditions,
            ["conditionals", "0", "conditions"],
            transformedValues,
        ),
        logicalOperator: pathOr(
            prev.logicalOperator,
            ["conditionals", "0", "logicalOperator"],
            transformedValues,
        ),
    }));
};

interface SpecificationFormProps {
    onSuccess: (newSpecification: Specification) => void;
    onFailure: (reason: Error) => void;
}

export const SpecificationForm: FC<SpecificationFormProps> = ({
    onFailure,
    onSuccess,
}) => {
    const [submitting, setSubmitting] = useState(false);
    const { addSpecification, updateSpecification } = useSpecification();
    const form = useSpecFormContext();
    const transformedValues = form.getTransformedValues();
    const { scrollIntoView, targetRef } = useScrollIntoView<HTMLInputElement>({
        duration: 700,
        offset: 150,
        cancelable: true,
    });

    const initialValRef = useRef<SpecFormValues | null>(null);
    const { mode } = transformedValues;
    const { setFieldValue } = form;

    if (transformedValues.formMode === "EDITION" && !initialValRef.current)
        initialValRef.current = clone(transformedValues);

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

    const onComplete = (specification: Specification) => {
        isFunction(onSuccess) && onSuccess(specification);

        scrollIntoView({ alignment: "center" });
        initialValRef.current = null;
        form.reset();
        humanReadableABIFormActions.reset();
        byteSlicesFormActions.reset();
        humanReadableABIParameterFormActions.reset();
        conditionsFormActions.reset();
    };

    useEffect(() => {
        if (initialValRef.current) {
            editModeStartup(initialValRef.current);
        }
    }, []);

    return (
        <Card shadow="sm" withBorder>
            <form
                onSubmit={form.onSubmit((values) => {
                    const specification = buildSpecification(values);
                    if (form.isValid() && specification !== null) {
                        setSubmitting(true);
                        const lifecycle = {
                            onFinished: () => setSubmitting((v) => !v),
                            onSuccess: () => onComplete(specification),
                            onFailure,
                        };

                        values.formMode === "EDITION"
                            ? updateSpecification(specification, lifecycle)
                            : addSpecification(specification, lifecycle);
                    } else {
                        form.validate();
                    }
                })}
            >
                <Stack>
                    <TextInput
                        ref={targetRef}
                        data-testid="specification-name-input"
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
                            {transformedValues.formMode === "EDITION"
                                ? "Update"
                                : "Save"}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Card>
    );
};
