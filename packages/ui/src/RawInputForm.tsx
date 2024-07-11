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
import { useForm } from "@mantine/form";
import { FC, useCallback, useEffect, useState } from "react";
import { TbAlertCircle, TbCheck } from "react-icons/tb";
import {
    BaseError,
    getAddress,
    Hex,
    isAddress,
    isHex,
    stringToHex,
    zeroAddress,
} from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import { TransactionProgress } from "./TransactionProgress";
import useUndeployedApplication from "./hooks/useUndeployedApplication";

type Format = "hex" | "utf";

export interface RawInputFormProps {
    applications: string[];
    isLoadingApplications: boolean;
    onSearchApplications: (applicationId: string) => void;
}

export const RawInputForm: FC<RawInputFormProps> = (props) => {
    const { applications, isLoadingApplications, onSearchApplications } = props;
    const form = useForm({
        validateInputOnBlur: true,
        initialValues: {
            application: "",
            rawInput: "0x",
            stringInput: "",
        },
        validate: {
            application: (value) =>
                value !== "" && isAddress(value) ? null : "Invalid application",
            rawInput: (value) => (isHex(value) ? null : "Invalid hex string"),
        },
        transformValues: (values) => ({
            address: isAddress(values.application)
                ? getAddress(values.application)
                : zeroAddress,
            rawInput: values.rawInput as Hex,
        }),
    });
    const { address, rawInput } = form.getTransformedValues();
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
    const [format, setFormat] = useState<Format>("hex");

    const onChangeFormat = useCallback((format: string | null) => {
        setFormat(format as Format);
    }, []);

    useEffect(() => {
        if (wait.isSuccess) {
            form.reset();
            onSearchApplications("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wait.isSuccess, onSearchApplications]);

    return (
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
                    value={format}
                    onChange={onChangeFormat}
                    data={[
                        { label: "Hex", value: "hex" },
                        { label: "String to Hex", value: "utf" },
                    ]}
                />

                {format === "hex" ? (
                    <Textarea
                        label="Raw input"
                        description="Raw input for the application"
                        withAsterisk
                        {...form.getInputProps("rawInput")}
                    />
                ) : (
                    <>
                        <Textarea
                            label="String input"
                            description="String input for the application"
                            mb={16}
                            {...form.getInputProps("stringInput")}
                            onChange={(event) => {
                                const nextValue = event.target.value;
                                form.setFieldValue("stringInput", nextValue);

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
                )}

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
    );
};
