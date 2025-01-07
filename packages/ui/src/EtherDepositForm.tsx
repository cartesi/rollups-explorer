import {
    useSimulateEtherPortalDepositEther,
    useWriteEtherPortalDepositEther,
} from "@cartesi/rollups-wagmi";
import {
    Alert,
    Autocomplete,
    Button,
    Collapse,
    Group,
    Loader,
    Stack,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { FC, useEffect } from "react";
import {
    TbAlertCircle,
    TbCheck,
    TbChevronDown,
    TbChevronUp,
} from "react-icons/tb";
import {
    BaseError,
    getAddress,
    Hex,
    isAddress,
    isHex,
    parseUnits,
    zeroAddress,
} from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { TransactionProgress } from "./TransactionProgress";
import useUndeployedApplication from "./hooks/useUndeployedApplication";
import { TransactionFormSuccessData } from "./DepositFormTypes";
import { useFormattedBalance } from "./hooks/useFormattedBalance";

export interface EtherDepositFormProps {
    applications: string[];
    isLoadingApplications: boolean;
    onSearchApplications: (applicationId: string) => void;
    onSuccess: (receipt: TransactionFormSuccessData) => void;
}

export const EtherDepositForm: FC<EtherDepositFormProps> = (props) => {
    const {
        applications,
        isLoadingApplications,
        onSearchApplications,
        onSuccess,
    } = props;
    const [advanced, { toggle: toggleAdvanced }] = useDisclosure(false);
    const { chain } = useAccount();
    const balance = useFormattedBalance();

    const form = useForm({
        validateInputOnBlur: true,
        initialValues: {
            application: "",
            amount: "",
            execLayerData: "0x",
        },
        validate: {
            application: (value) =>
                value !== "" && isAddress(value) ? null : "Invalid application",
            amount: (value) => {
                if (value !== "" && Number(value) > 0) {
                    if (Number(value) > Number(balance)) {
                        return `The amount ${value} exceeds your current balance of ${balance} ETH`;
                    }
                    return null;
                } else {
                    return "Invalid amount";
                }
            },
            execLayerData: (value) =>
                isHex(value) ? null : "Invalid hex string",
        },
        transformValues: (values) => ({
            address: isAddress(values.application)
                ? getAddress(values.application)
                : zeroAddress,
            amount:
                values.amount !== ""
                    ? parseUnits(
                          values.amount,
                          chain?.nativeCurrency.decimals ?? 18,
                      )
                    : undefined,
            execLayerData: values.execLayerData
                ? (values.execLayerData as Hex)
                : "0x",
        }),
    });
    const { address, amount, execLayerData } = form.getTransformedValues();
    const prepare = useSimulateEtherPortalDepositEther({
        args: [address, execLayerData],
        value: amount,
        query: {
            enabled: form.isValid(),
        },
    });
    const execute = useWriteEtherPortalDepositEther();
    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });
    const canSubmit =
        form.isValid() && !prepare.isLoading && prepare.error === null;
    const loading = execute.isPending || wait.isLoading;
    const isUndeployedApp = useUndeployedApplication(address, applications);

    useEffect(() => {
        if (wait.isSuccess) {
            onSuccess({ receipt: wait.data, type: "ETHER" });
            form.reset();
            execute.reset();
            onSearchApplications("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wait, onSearchApplications, onSuccess]);

    return (
        <form data-testid="ether-deposit-form">
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
                        form.errors?.application ||
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
                        This is a deposit to an undeployed application.
                    </Alert>
                )}

                <TextInput
                    type="number"
                    step="1"
                    min={0}
                    label="Amount"
                    description="Amount of ether to deposit"
                    placeholder="0"
                    rightSectionWidth={60}
                    rightSection={<Text>ETH</Text>}
                    withAsterisk
                    {...form.getInputProps("amount")}
                />

                <Collapse in={advanced}>
                    <Textarea
                        label="Extra data"
                        description="Extra execution layer data handled by the application"
                        {...form.getInputProps("execLayerData")}
                    />
                </Collapse>

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
                        confirmationMessage="Ether deposited successfully!"
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
                        onClick={() =>
                            execute.writeContract(prepare.data!.request)
                        }
                    >
                        Deposit
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
