import { FC, useEffect, useState } from "react";
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
import { TbCheck, TbAlertCircle } from "react-icons/tb";
import { BaseError, getAddress, isAddress, isHex, toHex } from "viem";
import { useWaitForTransaction } from "wagmi";
import { TransactionProgress } from "./TransactionProgress";

export interface ApplicationAutocompleteProps {
    applications: string[];
    application: string;
    error?: string;
    isLoading?: boolean;
    onChange: (application: string) => void;
}
export const ApplicationAutocomplete: FC<ApplicationAutocompleteProps> = (
    props,
) => {
    const {
        applications,
        application,
        error,
        isLoading = false,
        onChange,
    } = props;

    return (
        <>
            <Autocomplete
                label="Application"
                description="The application smart contract address"
                placeholder="0x"
                data={applications}
                value={application}
                error={error}
                withAsterisk
                rightSection={isLoading && <Loader size="xs" />}
                onChange={onChange}
            />

            {application !== "" && !applications.includes(application) && (
                <Alert variant="light" color="yellow" icon={<TbAlertCircle />}>
                    This is an undeployed application.
                </Alert>
            )}
        </>
    );
};

export interface EtherDepositFormProps {
    applications: string[];
    onSubmit: () => void;
}

export const EtherDepositForm: FC<EtherDepositFormProps> = (props) => {
    const { applications, onSubmit } = props;
    const [application, setApplication] = useState("");
    const [execLayerData, setExecLayerData] = useState("0x");
    const depositPrepare = usePrepareEtherPortalDepositEther({
        args: [
            isAddress(application) ? getAddress(application) : "0x1",
            toHex(execLayerData),
        ],
        enabled: isAddress(application),
    });
    const deposit = useEtherPortalDepositEther(depositPrepare.config);
    const depositWait = useWaitForTransaction(deposit.data);
    const canSubmit = application !== "" && depositPrepare.error === null;
    const loading =
        deposit.status === "loading" || depositWait.status === "loading";

    useEffect(() => {
        if (depositWait.status === "success") {
            setApplication("");
            setExecLayerData("0x");
            onSubmit();
        }
    }, [depositWait.status, onSubmit]);

    return (
        <form>
            <Stack>
                <ApplicationAutocomplete
                    application={application}
                    applications={applications}
                    error={(depositPrepare.error as BaseError)?.shortMessage}
                    isLoading={depositPrepare.isLoading}
                    onChange={setApplication}
                />

                <Textarea
                    label="Extra data"
                    description="Extra execution layer data handled by the application"
                    value={execLayerData}
                    error={
                        isHex(execLayerData) ? undefined : "Invalid hex string"
                    }
                    onChange={(e) => setExecLayerData(e.target.value)}
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
