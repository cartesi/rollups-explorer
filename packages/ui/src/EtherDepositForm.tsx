import { FC, useEffect } from "react";
import {
    useEtherPortalDepositEther,
    usePrepareEtherPortalDepositEther,
} from "@cartesi/rollups-wagmi";
import {
    Button,
    Collapse,
    Group,
    Stack,
    Autocomplete,
    Alert,
    Textarea,
    Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { TbCheck, TbAlertCircle } from "react-icons/tb";
import { BaseError, getAddress, isAddress, isHex, toHex } from "viem";
import { useWaitForTransaction } from "wagmi";
import { TransactionProgress } from "./TransactionProgress";

export interface EtherDepositFormProps {
    applications: string[];
    onSubmit: () => void;
}

export const EtherDepositForm: FC<EtherDepositFormProps> = (props) => {
    const { applications, onSubmit } = props;
    const form = useForm({
        validateInputOnBlur: true,
        initialValues: {
            application: "",
            execLayerData: "0x",
        },
        validate: {
            application: (value) =>
                value !== "" && isAddress(value) ? null : "Invalid application",
            execLayerData: (value) =>
                isHex(value) ? null : "Invalid hex string",
        },
        transformValues: (values) => ({
            address: isAddress(values.application)
                ? getAddress(values.application)
                : "0x1",
            hexExecLayerData: toHex(values.execLayerData),
        }),
    });
    const { address, hexExecLayerData } = form.getTransformedValues();
    const application = form.getInputProps("application");
    const depositPrepare = usePrepareEtherPortalDepositEther({
        args: [address, hexExecLayerData],
        enabled: isAddress(application.value),
    });
    const deposit = useEtherPortalDepositEther(depositPrepare.config);
    const depositWait = useWaitForTransaction(deposit.data);
    const canSubmit =
        form.isValid() &&
        !depositPrepare.isLoading &&
        depositPrepare.error === null;
    const loading =
        deposit.status === "loading" || depositWait.status === "loading";

    useEffect(() => {
        if (depositWait.status === "success") {
            form.reset();
            onSubmit();
        }
    }, [depositWait.status, onSubmit]);

    return (
        <form>
            <Stack>
                <Autocomplete
                    label="Application"
                    description="The application smart contract address"
                    placeholder="0x"
                    data={applications}
                    value={application.value}
                    withAsterisk
                    error={
                        form.errors?.application ||
                        (depositPrepare.error as BaseError)?.shortMessage
                    }
                    rightSection={
                        depositPrepare.isLoading && <Loader size="xs" />
                    }
                    onChange={(application) => {
                        form.setFieldValue("application", application);
                        form.clearFieldError("application");
                    }}
                    onBlur={() => application.onBlur()}
                />

                {!form.errors.application &&
                    isHex(application.value) &&
                    !applications.includes(application.value) && (
                        <Alert
                            variant="light"
                            color="yellow"
                            icon={<TbAlertCircle />}
                        >
                            This is an undeployed application.
                        </Alert>
                    )}

                <Textarea
                    label="Extra data"
                    description="Extra execution layer data handled by the application"
                    {...form.getInputProps("execLayerData")}
                />

                <Collapse
                    in={
                        deposit.isLoading ||
                        depositWait.isLoading ||
                        deposit.isSuccess ||
                        deposit.isError
                    }
                >
                    <TransactionProgress
                        prepare={depositPrepare}
                        execute={deposit}
                        wait={depositWait}
                        confirmationMessage="Ether deposited successfully!"
                        defaultErrorMessage={deposit.error?.message}
                    />
                </Collapse>

                <Group justify="right">
                    <Button
                        variant="filled"
                        disabled={!canSubmit}
                        leftSection={<TbCheck />}
                        loading={loading}
                        onClick={deposit.write}
                    >
                        Deposit
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
