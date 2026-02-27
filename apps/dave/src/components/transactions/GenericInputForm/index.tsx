"use client";
import type { Application } from "@cartesi/viem";
import { inputBoxAddress } from "@cartesi/wagmi";
import {
    Button,
    Collapse,
    Group,
    SegmentedControl,
    Stack,
    Textarea,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { type FC, useCallback, useEffect, useMemo } from "react";
import { TbCheck } from "react-icons/tb";
import {
    type Abi,
    type AbiFunction,
    encodeAbiParameters,
    encodeFunctionData,
    stringToHex,
} from "viem";
import { type TransactionFormSuccessData } from "../DepositFormTypes";
import TransactionDetails from "../TransactionDetails";
import { TransactionProgress } from "../TransactionProgress";
import { transactionState } from "../TransactionState";
import { AbiFields } from "./AbiFields";
import { FormProvider } from "./context";
import { useInputBoxAddInput } from "./hooks/useInputBoxAddInput";
import type {
    AbiInputParam,
    FormMode,
    FormSpecification,
    GenericFormAbiFunction,
} from "./types";
import { useGenericInputForm } from "./useGenericInputForm";
import { generateFinalValues } from "./utils";

export interface GenericInputFormSpecification {
    id: string;
    name: string;
    abi: Abi;
}

export interface GenericInputFormProps {
    application: Application;
    specifications: GenericInputFormSpecification[];
    onSuccess: (receipt: TransactionFormSuccessData) => void;
}

const formModeSegmentData = [
    { label: "Hex", value: "hex" },
    {
        label: "String to Hex",
        value: "string",
    },
    { label: "ABI to Hex", value: "abi" },
];

export const GenericInputForm: FC<GenericInputFormProps> = (props) => {
    const { application, specifications, onSuccess } = props;

    const form = useGenericInputForm(specifications);
    const {
        address,
        rawInput,
        mode,
        abiFunction,
        selectedSpecification,
        specificationMode,
        abiFunctionName,
    } = form.getTransformedValues();

    const { prepare, execute, wait } = useInputBoxAddInput({
        contractParams: {
            args: [address, rawInput],
        },
        isQueryEnabled: form.isValid(),
    });

    const isFormValid = form.isValid();
    const canSubmit = isFormValid && prepare.error === null;
    const abiFunctionParams = form.getInputProps("abiFunctionParams");
    const { disabled: sendDisabled, loading: sendLoading } = transactionState(
        prepare,
        execute,
        wait,
        true,
    );

    const details = useMemo(
        () => [
            {
                legend: "Application Address",
                text: application.applicationAddress,
            },
            { legend: "Input Box Address", text: inputBoxAddress },
        ],
        [application.applicationAddress],
    );

    const onChangeFormMode = useCallback(
        (mode: string | null) => {
            const application = form.getInputProps("application");
            form.reset();
            form.setFieldValue("mode", mode as FormMode);
            form.setFieldValue("application", application.value);
        },
        [form],
    );

    const encodeFunctionParamsDebounced = useDebouncedCallback(
        (params: AbiInputParam[]) => {
            const abiFunctions =
                (selectedSpecification?.abi as GenericFormAbiFunction[]) ?? [];
            const nextAbiFunction = abiFunctions.find(
                (f) => f.name === abiFunctionName,
            );

            if (nextAbiFunction) {
                const finalValues = generateFinalValues(
                    [...nextAbiFunction.inputs],
                    params,
                );

                if (specificationMode === "json_abi") {
                    const payload = encodeFunctionData({
                        abi: (selectedSpecification as FormSpecification)?.abi,
                        functionName: (abiFunction as AbiFunction)?.name,
                        args: finalValues,
                    });
                    form.setFieldValue("rawInput", payload);
                } else if (specificationMode === "abi_params") {
                    const payload = encodeAbiParameters(
                        nextAbiFunction.inputs,
                        finalValues,
                    );
                    form.setFieldValue("rawInput", payload);
                }
            }
        },
        400,
    );

    useEffect(() => {
        form.setFieldValue("application", application.applicationAddress);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [application.applicationAddress]);

    useEffect(() => {
        if (wait.isSuccess) {
            onSuccess({ receipt: wait.data, type: "RAW" });
            form.reset();
            execute.reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wait, onSuccess]);

    useEffect(() => {
        if (isFormValid) {
            encodeFunctionParamsDebounced(abiFunctionParams.value);
        }
    }, [abiFunctionParams.value, isFormValid, encodeFunctionParamsDebounced]);

    return (
        <FormProvider form={form}>
            <form data-testid="raw-input-form">
                <Stack>
                    <TransactionDetails details={details} />
                    <SegmentedControl
                        value={mode}
                        onChange={onChangeFormMode}
                        data={formModeSegmentData}
                    />

                    {mode === "hex" ? (
                        <Textarea
                            label="Hex input"
                            description="Hex input for the application"
                            withAsterisk
                            data-testid="hex-textarea"
                            {...form.getInputProps("rawInput")}
                        />
                    ) : mode === "string" ? (
                        <>
                            <Textarea
                                label="String input"
                                description="String input for the application"
                                data-testid="string-to-hex-input"
                                {...form.getInputProps("stringInput")}
                                onChange={(event) => {
                                    const nextValue = event.target.value;
                                    form.setFieldValue(
                                        "stringInput",
                                        nextValue,
                                    );

                                    form.setFieldValue(
                                        "rawInput",
                                        stringToHex(nextValue),
                                    );
                                }}
                            />

                            <Textarea
                                label="Hex value"
                                description="Encoded hex value for the application"
                                readOnly
                                {...form.getInputProps("rawInput")}
                            />
                        </>
                    ) : mode === "abi" ? (
                        <AbiFields specifications={specifications} />
                    ) : null}

                    <Collapse
                        in={
                            execute.isPending ||
                            wait.isLoading ||
                            execute.isSuccess ||
                            execute.isError
                        }
                    >
                        <TransactionProgress
                            prepare={prepare}
                            execute={execute}
                            wait={wait}
                            confirmationMessage="Input sent successfully!"
                            defaultErrorMessage={execute.error?.message}
                        />
                    </Collapse>

                    <Group justify="right">
                        <Button
                            variant="filled"
                            disabled={sendDisabled || !canSubmit}
                            leftSection={<TbCheck />}
                            loading={canSubmit && sendLoading}
                            data-testid="generic-input-submit-button"
                            onClick={() =>
                                execute.writeContract(prepare.data!.request)
                            }
                        >
                            Send
                        </Button>
                    </Group>
                </Stack>
            </form>
        </FormProvider>
    );
};
