import {
    useSimulateDAppAddressRelayRelayDAppAddress,
    useWriteDAppAddressRelayRelayDAppAddress,
} from "@cartesi/rollups-wagmi";
import { Alert, Button, Collapse, Group, Loader, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { FC, useEffect } from "react";
import { TbAlertCircle, TbCheck } from "react-icons/tb";
import { BaseError, getAddress, isAddress, zeroAddress } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import ApplicationAutocomplete from "./ApplicationAutocomplete";
import { TransactionFormSuccessData } from "./DepositFormTypes";
import { TransactionProgress } from "./TransactionProgress";
import { transactionState } from "./TransactionState";
import { Application, RollupVersion } from "./commons/interfaces";
import useUndeployedApplication from "./hooks/useUndeployedApplication";

export interface AddressRelayFormProps {
    applications: Application[];
    isLoadingApplications: boolean;
    onSearchApplications: (
        appAddress: string,
        rollupVersion?: RollupVersion,
    ) => void;
    onSuccess: (receipt: TransactionFormSuccessData) => void;
}

export const AddressRelayForm: FC<AddressRelayFormProps> = (props) => {
    const {
        applications,
        isLoadingApplications,
        onSearchApplications,
        onSuccess,
    } = props;
    const form = useForm({
        validateInputOnChange: true,
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
    const addressList = applications.map((a) => a.address);
    const isUndeployedApp = useUndeployedApplication(address, addressList);

    useEffect(() => {
        onSearchApplications("", "v1");
        return () => onSearchApplications("");
    }, []);

    useEffect(() => {
        if (wait.isSuccess) {
            onSuccess({ receipt: wait.data, type: "ADDRESS-RELAY" });
            form.reset();
            execute.reset();
        }
    }, [wait, form, execute, onSuccess]);

    return (
        <form data-testid="address-relay-form">
            <Stack>
                <ApplicationAutocomplete
                    label="Application"
                    data-testid="application"
                    description="The application address to relay."
                    placeholder="0x"
                    applications={applications}
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
                        onSearchApplications(nextValue, "v1");
                    }}
                    onApplicationSelected={(app) => {
                        form.setFieldValue("application", app.address);
                        onSearchApplications(app.address, "v1");
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
                        data-testid="send-transaction"
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
