import {
    useSimulateInputBoxAddInput,
    useWriteInputBoxAddInput,
} from "@cartesi/rollups-wagmi";
import {
    Alert,
    Autocomplete,
    Button,
    Collapse,
    Group,
    Loader,
    SegmentedControl,
    Stack,
    Textarea,
} from "@mantine/core";
import { FC, useCallback, useEffect } from "react";
import { TbAlertCircle, TbCheck } from "react-icons/tb";
import { Abi, BaseError, stringToHex } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import { TransactionProgress } from "../TransactionProgress";
import useUndeployedApplication from "../hooks/useUndeployedApplication";
import { TransactionFormSuccessData } from "../DepositFormTypes";
import { AbiFields } from "./AbiFields";
import { FormMode } from "./types";
import { FormProvider } from "./context";
import { useGenericInputForm } from "./useGenericInputForm";

export interface GenericInputFormSpecification {
    id: string;
    name: string;
    abi: Abi;
}

export interface GenericInputFormProps {
    applications: string[];
    specifications: GenericInputFormSpecification[];
    isLoadingApplications: boolean;
    onSearchApplications: (applicationId: string) => void;
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
    const form = useGenericInputForm(specifications);
    const { address, rawInput, mode } = form.getTransformedValues();
    const prepare = useSimulateInputBoxAddInput({
        args: [address, rawInput],
        query: {
            enabled: form.isValid(),
        },
    });

    const execute = useWriteInputBoxAddInput();
    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });
    const loading = execute.isPending || wait.isLoading;
    const canSubmit = form.isValid() && prepare.error === null;
    const isUndeployedApp = useUndeployedApplication(address, applications);

    const onChangeFormMode = useCallback(
        (mode: string | null) => {
            form.reset();
            form.setFieldValue("mode", mode as FormMode);
        },
        [form],
    );

    useEffect(() => {
        if (wait.isSuccess) {
            onSuccess({ receipt: wait.data, type: "RAW" });
            form.reset();
            execute.reset();
            onSearchApplications("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wait, onSearchApplications, onSuccess]);

    useEffect(() => {
        console.log("errors::", form.errors);
        console.log("isValid::", form.isValid());
    }, [form]);

    return (
        <FormProvider form={form}>
            <form data-testid="raw-input-form">
                <Stack>
                    <Autocomplete
                        label="Application"
                        description="The application smart contract address"
                        placeholder="0x"
                        data={applications}
                        withAsterisk
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
                    />

                    {!form.errors.application && isUndeployedApp && (
                        <Alert
                            variant="light"
                            color="yellow"
                            icon={<TbAlertCircle />}
                        >
                            This is an undeployed application.
                        </Alert>
                    )}

                    <SegmentedControl
                        value={mode}
                        onChange={onChangeFormMode}
                        data={[
                            { label: "Hex", value: "hex" },
                            { label: "String to Hex", value: "string" },
                            { label: "ABI to Hex", value: "abi" },
                        ]}
                    />

                    {mode === "hex" ? (
                        <Textarea
                            label="Hex input"
                            description="Hex input for the application"
                            withAsterisk
                            {...form.getInputProps("rawInput")}
                        />
                    ) : mode === "string" ? (
                        <>
                            <Textarea
                                label="String input"
                                description="String input for the application"
                                mb={16}
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
                            confirmationMessage="Raw input sent successfully!"
                            defaultErrorMessage={execute.error?.message}
                        />
                    </Collapse>

                    <Group justify="right">
                        <Button
                            variant="filled"
                            disabled={!canSubmit}
                            leftSection={<TbCheck />}
                            loading={loading}
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
