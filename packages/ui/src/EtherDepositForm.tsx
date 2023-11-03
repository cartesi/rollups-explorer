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
import { useDisclosure } from "@mantine/hooks";
import {
    TbCheck,
    TbAlertCircle,
    TbChevronUp,
    TbChevronDown,
} from "react-icons/tb";
import {
    BaseError,
    getAddress,
    isAddress,
    isHex,
    toHex,
    zeroAddress,
} from "viem";
import { useWaitForTransaction } from "wagmi";
import { TransactionProgress } from "./TransactionProgress";

export interface EtherDepositFormProps {
    applications: string[];
    onSubmit: () => void;
}

export const EtherDepositForm: FC<EtherDepositFormProps> = (props) => {
    const { applications, onSubmit } = props;
    const [advanced, { toggle: toggleAdvanced }] = useDisclosure(false);
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
                : zeroAddress,
            execLayerData: toHex(values.execLayerData),
        }),
    });
    const { address, execLayerData } = form.getTransformedValues();
    const application = form.getInputProps("application");
    const prepare = usePrepareEtherPortalDepositEther({
        args: [address, execLayerData],
        enabled: isAddress(application.value),
    });
    const execute = useEtherPortalDepositEther(prepare.config);
    const wait = useWaitForTransaction(execute.data);
    const canSubmit =
        form.isValid() && !prepare.isLoading && prepare.error === null;
    const loading = execute.status === "loading" || wait.status === "loading";

    useEffect(() => {
        if (wait.status === "success") {
            form.reset();
            onSubmit();
        }
    }, [wait.status, onSubmit]);

    return (
        <form>
            <Stack>
                <Autocomplete
                    label="Application"
                    description="The application smart contract address"
                    placeholder="0x"
                    data={applications}
                    withAsterisk
                    rightSection={prepare.isLoading && <Loader size="xs" />}
                    {...form.getInputProps("application")}
                    error={
                        form.errors?.application ||
                        (prepare.error as BaseError)?.shortMessage
                    }
                />

                {!form.errors.application &&
                    address != zeroAddress &&
                    !applications.includes(application.value) && (
                        <Alert
                            variant="light"
                            color="yellow"
                            icon={<TbAlertCircle />}
                        >
                            This is an undeployed application.
                        </Alert>
                    )}

                <Collapse in={advanced}>
                    <Textarea
                        label="Extra data"
                        description="Extra execution layer data handled by the application"
                        {...form.getInputProps("execLayerData")}
                    />
                </Collapse>

                <Collapse
                    in={
                        execute.isLoading ||
                        wait.isLoading ||
                        execute.isSuccess ||
                        execute.isError
                    }
                >
                    <TransactionProgress
                        prepare={prepare}
                        execute={execute}
                        wait={wait}
                        confirmationMessage="Ether executeed successfully!"
                        defaultErrorMessage={execute.error?.message}
                    />
                </Collapse>

                <Group justify="right">
                    <Button
                        leftSection={
                            advanced ? <TbChevronUp /> : <TbChevronDown />
                        }
                        size="xs"
                        visibleFrom="sm"
                        variant="transparent"
                        onClick={toggleAdvanced}
                    >
                        Advanced
                    </Button>

                    <Button
                        variant="filled"
                        disabled={!canSubmit}
                        leftSection={<TbCheck />}
                        loading={loading}
                        onClick={execute.write}
                    >
                        Deposit
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
