import {
    Alert,
    Button,
    Collapse,
    Group,
    Loader,
    SegmentedControl,
    Stack,
    Textarea,
} from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { isNotNil } from "ramda";
import { FC, useCallback, useEffect, useState } from "react";
import { TbAlertCircle, TbCheck } from "react-icons/tb";
import {
    Abi,
    AbiFunction,
    BaseError,
    encodeAbiParameters,
    encodeFunctionData,
    stringToHex,
} from "viem";
import ApplicationAutocomplete from "../ApplicationAutocomplete";
import { TransactionFormSuccessData } from "../DepositFormTypes";
import RollupVersionSegment from "../RollupVersionSegment";
import { TransactionProgress } from "../TransactionProgress";
import { transactionState } from "../TransactionState";
import { Application, RollupVersion } from "../commons/interfaces";
import useUndeployedApplication from "../hooks/useUndeployedApplication";
import { AbiFields } from "./AbiFields";
import { FormProvider } from "./context";
import { useInputBoxAddInput } from "./hooks/useInputBoxAddInput";
import {
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
    applications: Application[];
    specifications: GenericInputFormSpecification[];
    isLoadingApplications: boolean;
    onSearchApplications: (
        appAddress: string,
        rollupVersion?: RollupVersion,
    ) => void;
    onSuccess: (receipt: TransactionFormSuccessData) => void;
}

export const GenericInputForm: FC<GenericInputFormProps> = (props) => {
    const {
        applications,
        specifications,
        isLoadingApplications,
        onSearchApplications,
        onSuccess,
    } = props;

    const [userSelectedAppVersion, setUserSelectedAppVersion] = useState<
        RollupVersion | undefined
    >();

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

    // The app version checks
    const hasFoundOneApp = applications.length === 1;
    const app = hasFoundOneApp ? applications[0] : undefined;
    const appVersion = app?.rollupVersion || userSelectedAppVersion;

    const { prepare, execute, wait } = useInputBoxAddInput({
        appVersion,
        contractParams: {
            args: [address, rawInput],
        },
        isQueryEnabled: form.isValid(),
    });

    const isFormValid = form.isValid();
    const canSubmit = isFormValid && prepare.error === null;
    const foundAddresses = applications.map((a) => a.address);
    const isUndeployedApp = useUndeployedApplication(address, foundAddresses);
    const abiFunctionParams = form.getInputProps("abiFunctionParams");
    const { disabled: sendDisabled, loading: sendLoading } = transactionState(
        prepare,
        execute,
        wait,
        true,
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

    const showUndeployedSection =
        !form.errors.application && isUndeployedApp && !isLoadingApplications;
    const showInputSection = isNotNil(appVersion) && !isLoadingApplications;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => () => onSearchApplications(""), []);

    useEffect(() => {
        if (wait.isSuccess) {
            onSuccess({ receipt: wait.data, type: "RAW" });
            form.reset();
            execute.reset();
            onSearchApplications("");
            setUserSelectedAppVersion(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wait, onSearchApplications, onSuccess]);

    useEffect(() => {
        if (isFormValid) {
            encodeFunctionParamsDebounced(abiFunctionParams.value);
        }
    }, [abiFunctionParams.value, isFormValid, encodeFunctionParamsDebounced]);

    return (
        <FormProvider form={form}>
            <form data-testid="raw-input-form">
                <Stack>
                    <ApplicationAutocomplete
                        label="Application"
                        description="The application smart contract address"
                        placeholder="0x"
                        applications={applications}
                        withAsterisk
                        data-testid="application-autocomplete"
                        rightSection={
                            (prepare.isLoading || isLoadingApplications) && (
                                <Loader size="xs" />
                            )
                        }
                        {...form.getInputProps("application")}
                        error={
                            form.errors.application ||
                            (prepare.error as BaseError)?.shortMessage
                        }
                        onChange={(nextValue) => {
                            form.setFieldValue("application", nextValue);
                            onSearchApplications(nextValue);
                        }}
                        onApplicationSelected={(app) => {
                            form.setFieldValue("application", app.address);
                            onSearchApplications(
                                app.address,
                                app.rollupVersion,
                            );
                        }}
                    />

                    {showUndeployedSection && (
                        <>
                            <Alert
                                variant="light"
                                color="yellow"
                                icon={<TbAlertCircle />}
                            >
                                This is an undeployed application.
                            </Alert>
                            <RollupVersionSegment
                                onChange={setUserSelectedAppVersion}
                                value={userSelectedAppVersion ?? ""}
                                onUnmount={() => {
                                    setUserSelectedAppVersion(undefined);
                                }}
                            />
                        </>
                    )}

                    {appVersion && (
                        <Collapse
                            in={showInputSection}
                            data-testid="generic-input-fields"
                        >
                            <Stack>
                                <SegmentedControl
                                    value={mode}
                                    onChange={onChangeFormMode}
                                    data={[
                                        { label: "Hex", value: "hex" },
                                        {
                                            label: "String to Hex",
                                            value: "string",
                                        },
                                        { label: "ABI to Hex", value: "abi" },
                                    ]}
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
                                            {...form.getInputProps(
                                                "stringInput",
                                            )}
                                            onChange={(event) => {
                                                const nextValue =
                                                    event.target.value;
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
                                    <AbiFields
                                        specifications={specifications}
                                    />
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
                                        confirmationMessage="Raw input sent successfully!"
                                        defaultErrorMessage={
                                            execute.error?.message
                                        }
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
                                            execute.writeContract(
                                                prepare.data!.request,
                                            )
                                        }
                                    >
                                        Send
                                    </Button>
                                </Group>
                            </Stack>
                        </Collapse>
                    )}
                </Stack>
            </form>
        </FormProvider>
    );
};
