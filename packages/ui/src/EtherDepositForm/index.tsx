import {
    useSimulateEtherPortalDepositEther,
    useWriteEtherPortalDepositEther,
} from "@cartesi/rollups-wagmi";
import {
    Alert,
    Autocomplete,
    Button,
    Collapse,
    Flex,
    Group,
    Loader,
    Stack,
    Text,
    TextInput,
    Textarea,
    UnstyledButton,
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
    Hex,
    getAddress,
    isAddress,
    isHex,
    parseUnits,
    zeroAddress,
} from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { TransactionFormSuccessData } from "../DepositFormTypes";
import { TransactionProgress } from "../TransactionProgress";
import { useAccountBalance } from "../hooks/useAccountBalance";
import useUndeployedApplication from "../hooks/useUndeployedApplication";

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
    const accountBalance = useAccountBalance();

    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            accountBalance: accountBalance,
            application: "",
            amount: "",
            execLayerData: "0x",
        },
        validate: {
            application: (value) =>
                value !== "" && isAddress(value) ? null : "Invalid application",
            amount: (value, values) => {
                if (value !== "" && Number(value) > 0) {
                    const val = parseUnits(
                        value,
                        values.accountBalance.decimals,
                    );
                    if (val > values.accountBalance.value) {
                        return `The amount ${value} exceeds your current balance of ${values.accountBalance.formatted} ETH`;
                    }
                    return null;
                } else {
                    return "Invalid amount";
                }
            },
            execLayerData: (value) =>
                isHex(value) ? null : "Invalid hex string",
        },
        transformValues: (values) => {
            return {
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
            };
        },
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
            accountBalance.refetch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wait, onSearchApplications, onSuccess, accountBalance]);

    useEffect(() => {
        form.setValues({ accountBalance: accountBalance });

        if (form.isDirty("amount")) {
            form.validateField("amount");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [accountBalance]);

    return (
        <form data-testid="ether-deposit-form">
            <Stack>
                <Autocomplete
                    label="Application"
                    description="The application smart contract address"
                    data-testid="application-input"
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

                <Stack gap="xs">
                    <TextInput
                        type="number"
                        step="1"
                        min={0}
                        label="Amount"
                        description="Amount of ether to deposit"
                        data-testid="amount-input"
                        placeholder="0"
                        rightSectionWidth={60}
                        rightSection={<Text>ETH</Text>}
                        withAsterisk
                        {...form.getInputProps("amount")}
                    />

                    <Flex c={"dark.2"} gap="3">
                        <Text fz="xs">Balance: {accountBalance.formatted}</Text>
                        {accountBalance.value > 0 && (
                            <UnstyledButton
                                fz={"xs"}
                                c={"cyan"}
                                onClick={() => {
                                    form.setFieldValue(
                                        "amount",
                                        accountBalance.formatted,
                                    );
                                }}
                                data-testid="max-button"
                            >
                                Max
                            </UnstyledButton>
                        )}
                    </Flex>
                </Stack>

                <Collapse in={advanced}>
                    <Textarea
                        data-testid="eth-extra-data-input"
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
