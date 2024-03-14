import {
    useWriteInputBoxAddInput,
    useSimulateInputBoxAddInput,
} from "@cartesi/rollups-wagmi";
import {
    Alert,
    Autocomplete,
    Button,
    Collapse,
    Group,
    Loader,
    Stack,
    Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { FC, useEffect, useMemo } from "react";
import { TbAlertCircle, TbCheck } from "react-icons/tb";
import {
    BaseError,
    getAddress,
    Hex,
    isAddress,
    isHex,
    zeroAddress,
} from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import { TransactionProgress } from "./TransactionProgress";
import useUndeployedApplication from "./hooks/useUndeployedApplication";

export interface RawInputFormProps {
    applications: string[];
    isLoadingApplications: boolean;
    onSearchApplications: (applicationId: string) => void;
}

export const RawInputForm: FC<RawInputFormProps> = (props) => {
    const { applications, isLoadingApplications, onSearchApplications } = props;
    const addresses = useMemo(
        () => applications.map(getAddress),
        [applications],
    );
    const form = useForm({
        validateInputOnBlur: true,
        initialValues: {
            application: "",
            rawInput: "0x",
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

                <Textarea
                    label="Raw input"
                    description="Raw input for the application"
                    withAsterisk
                    {...form.getInputProps("rawInput")}
                />

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
