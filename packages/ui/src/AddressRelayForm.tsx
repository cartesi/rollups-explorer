import {
    useSimulateDAppAddressRelayRelayDAppAddress,
    useWriteDAppAddressRelayRelayDAppAddress,
} from "@cartesi/rollups-wagmi";
import {
    Alert,
    Autocomplete,
    Button,
    Collapse,
    Group,
    Loader,
    Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { is } from "ramda";
import { FC, useEffect } from "react";
import { TbAlertCircle, TbCheck } from "react-icons/tb";
import { BaseError, getAddress, isAddress, zeroAddress } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import { TransactionFormSuccessData } from "./DepositFormTypes";
import { TransactionProgress } from "./TransactionProgress";
import { transactionState } from "./TransactionState";
import useUndeployedApplication from "./hooks/useUndeployedApplication";

export interface AddressRelayFormProps {
    applications: string[];
    isLoadingApplications: boolean;
    onSearchApplications: (applicationId: string) => void;
    onSuccess?: (receipt: TransactionFormSuccessData) => void;
}

export const AddressRelayForm: FC<AddressRelayFormProps> = (props) => {
    const {
        applications,
        isLoadingApplications,
        onSearchApplications,
        onSuccess,
    } = props;
    const form = useForm({
        validateInputOnBlur: true,
        initialValues: {
            application: "",
        },
        validate: {
            application: (value) =>
                value !== "" && isAddress(value)
                    ? null
                    : "Invalid application address",
        },
        transformValues: (values) => ({
            address: isAddress(values.application)
                ? getAddress(values.application)
                : zeroAddress,
        }),
    });
    const { address } = form.getTransformedValues();
    const prepare = useSimulateDAppAddressRelayRelayDAppAddress({
        args: [address],
        query: {
            enabled: address !== zeroAddress,
        },
    });

    const execute = useWriteDAppAddressRelayRelayDAppAddress();
    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });

    const { loading, disabled } = transactionState(
        prepare,
        execute,
        wait,
        true,
    );
    const canSubmit = form.isValid();
    const isUndeployedApp = useUndeployedApplication(address, applications);

    useEffect(() => {
        if (wait.isSuccess) {
            if (is(Function, onSuccess))
                onSuccess({ receipt: wait.data, type: "ADDRESS-RELAY" });
            form.reset();
            execute.reset();
        }
    }, [wait.isSuccess, wait.data, form, execute, onSuccess]);

    return (
        <form data-testid="address-relay-form">
            <Stack>
                <Autocomplete
                    label="Application"
                    data-testid="application"
                    description="The application address to relay."
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

                <Collapse in={!execute.isIdle || execute.isError}>
                    <TransactionProgress
                        prepare={prepare}
                        execute={execute}
                        wait={wait}
                        defaultErrorMessage={execute.error?.message}
                    />
                </Collapse>

                <Group justify="right">
                    <Button
                        variant="filled"
                        disabled={disabled || !canSubmit}
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
