import {
    erc20ABI,
    erc20PortalAddress,
    useErc20Approve,
    useErc20PortalDepositErc20Tokens,
    usePrepareErc20Approve,
    usePrepareErc20PortalDepositErc20Tokens,
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
import { isEmpty } from "ramda";
import { FC, useEffect, useState } from "react";
import {
    TbAlertCircle,
    TbCheck,
    TbChevronDown,
    TbChevronUp,
    TbPigMoney,
} from "react-icons/tb";
import {
    BaseError,
    formatUnits,
    getAddress,
    isAddress,
    isHex,
    parseUnits,
    toHex,
    zeroAddress,
} from "viem";
import { useAccount, useContractReads, useWaitForTransaction } from "wagmi";
import { TransactionProgress } from "./TransactionProgress";
import { TransactionStageStatus } from "./TransactionStatus";

export const transactionButtonState = (
    prepare: TransactionStageStatus,
    execute: TransactionStageStatus,
    wait: TransactionStageStatus,
    write?: () => void,
    disableOnSuccess: boolean = true,
) => {
    const loading =
        prepare.status === "loading" ||
        execute.status === "loading" ||
        wait.status === "loading";

    const disabled =
        prepare.error != null ||
        (disableOnSuccess && wait.status === "success") ||
        !write;

    return { loading, disabled };
};

export interface ERC20DepositFormProps {
    tokens: string[];
    applications: string[];
    isLoadingApplications: boolean;
    onSearchApplications: (applicationId: string) => void;
    onSearchTokens: (tokenId: string) => void;
}

export const ERC20DepositForm: FC<ERC20DepositFormProps> = (props) => {
    const {
        tokens,
        applications,
        isLoadingApplications,
        onSearchApplications,
        onSearchTokens,
    } = props;

    const [advanced, { toggle: toggleAdvanced }] = useDisclosure(false);

    // connected account
    const { address } = useAccount();

    const [decimals, setDecimals] = useState<number | undefined>();

    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            application: "",
            erc20Address: "",
            amount: "",
            execLayerData: "0x",
        },
        validate: {
            application: (value) => {
                if (isEmpty(value)) return `Please input ERC20 Address`;
                if (!isAddress(value)) {
                    return `Invalid Application address`;
                }
                return null;
            },
            erc20Address: (value) => {
                if (isEmpty(value)) return `Please input ERC20 Address`;
                if (!isAddress(value)) {
                    return `Invalid ERC20 address`;
                }
                return null;
            },
            amount: (value) =>
                value !== "" && Number(value) > 0 ? null : "Invalid amount",
            execLayerData: (value) =>
                isHex(value) ? null : "Invalid hex string",
        },
        transformValues: (values) => ({
            address: isAddress(values.application)
                ? getAddress(values.application)
                : zeroAddress,
            erc20Address: isAddress(values.erc20Address)
                ? getAddress(values.erc20Address)
                : zeroAddress,
            erc20ContractAddress: isAddress(values.erc20Address)
                ? getAddress(values.erc20Address)
                : undefined,
            amountBigInt:
                values.amount !== "" && decimals
                    ? parseUnits(Number(values.amount).toString(), decimals)
                    : undefined,
            execLayerData: toHex(values.execLayerData),
        }),
    });

    const {
        address: applicationAddress,
        erc20Address,
        erc20ContractAddress,
        execLayerData,
        amountBigInt,
    } = form.getTransformedValues();

    // query token information in a multicall
    const erc20Contract = {
        abi: erc20ABI,
        address: erc20ContractAddress,
    };
    const erc20 = useContractReads({
        contracts: [
            { ...erc20Contract, functionName: "decimals" },
            { ...erc20Contract, functionName: "symbol" },
            {
                ...erc20Contract,
                functionName: "allowance",
                args: [getAddress(address!), erc20PortalAddress],
            },
            { ...erc20Contract, functionName: "balanceOf", args: [address!] },
        ],
        watch: true,
    });

    useEffect(() => {
        if (erc20.data?.[0]?.result) {
            setDecimals(erc20.data?.[0].result as number | undefined);
        }
    }, [erc20.data]);

    useEffect(() => {}, [tokens]);

    const symbol = erc20.data?.[1].result as string | undefined;
    const allowance = erc20.data?.[2].result as bigint | undefined;
    const balance = erc20.data?.[3].result as bigint | undefined;
    const erc20Errors = erc20.data
        ? erc20.data
              .filter((d) => d.error instanceof Error)
              .map((d) => {
                  return (d.error as BaseError).shortMessage;
              })
        : [];

    // prepare approve transaction
    const approvePrepare = usePrepareErc20Approve({
        address: erc20Address,
        args: [erc20PortalAddress, amountBigInt!],
        enabled:
            amountBigInt !== undefined &&
            allowance !== undefined &&
            amountBigInt > allowance,
    });
    const approve = useErc20Approve(approvePrepare.config);
    const approveWait = useWaitForTransaction(approve.data);

    // prepare deposit transaction
    const depositPrepare = usePrepareErc20PortalDepositErc20Tokens({
        args: [erc20Address, applicationAddress, amountBigInt!, execLayerData],
        enabled:
            amountBigInt !== undefined &&
            balance !== undefined &&
            allowance !== undefined &&
            !form.errors.erc20Address &&
            !form.errors.application &&
            isHex(execLayerData) &&
            amountBigInt <= balance &&
            amountBigInt <= allowance,
    });
    const deposit = useErc20PortalDepositErc20Tokens(depositPrepare.config);
    const depositWait = useWaitForTransaction(deposit.data);

    // true if current allowance is less than the amount to deposit
    const needApproval =
        allowance !== undefined &&
        decimals !== undefined &&
        amountBigInt !== undefined &&
        allowance < amountBigInt;

    const canDeposit =
        allowance !== undefined &&
        balance !== undefined &&
        decimals !== undefined &&
        amountBigInt !== undefined &&
        amountBigInt > 0 &&
        amountBigInt <= allowance &&
        amountBigInt <= balance;

    const { disabled: approveDisabled, loading: approveLoading } =
        transactionButtonState(
            approvePrepare,
            approve,
            approveWait,
            approve.write,
            false,
        );
    const { disabled: depositDisabled, loading: depositLoading } =
        transactionButtonState(
            depositPrepare,
            deposit,
            depositWait,
            deposit.write,
            true,
        );

    return (
        <form data-testid="erc20-deposit-form">
            <Stack>
                <Autocomplete
                    label="Application"
                    description="The application smart contract address"
                    placeholder="0x"
                    data={applications}
                    withAsterisk
                    data-testid="application"
                    rightSection={isLoadingApplications && <Loader size="xs" />}
                    {...form.getInputProps("application")}
                    onChange={(nextValue) => {
                        form.setFieldValue("application", nextValue);
                        onSearchApplications(nextValue);
                    }}
                />

                {isAddress(applicationAddress) &&
                    applicationAddress !== zeroAddress &&
                    !applications.length && (
                        <Alert
                            variant="light"
                            color="yellow"
                            icon={<TbAlertCircle />}
                        >
                            This is a deposit to an undeployed application.
                        </Alert>
                    )}

                <Autocomplete
                    label="ERC-20"
                    description="The ERC-20 smart contract address"
                    placeholder="0x"
                    data={tokens}
                    withAsterisk
                    data-testid="erc20Address"
                    rightSection={erc20.isLoading && <Loader size="xs" />}
                    {...form.getInputProps("erc20Address")}
                    error={erc20Errors[0] || form.errors.erc20Address}
                    onChange={(nextValue) => {
                        const formattedValue = nextValue.substring(
                            nextValue.indexOf("0x"),
                        );
                        form.setFieldValue("erc20Address", formattedValue);
                        onSearchTokens(formattedValue);
                    }}
                />

                {isAddress(erc20Address) &&
                    erc20Address !== zeroAddress &&
                    !tokens.length &&
                    !erc20.isLoading && (
                        <Alert
                            variant="light"
                            color="yellow"
                            icon={<TbAlertCircle />}
                        >
                            This is the first deposit of that token.
                        </Alert>
                    )}

                <Collapse in={erc20.isSuccess && erc20Errors.length == 0}>
                    <Stack>
                        <TextInput
                            type="number"
                            min={0}
                            step={1}
                            label="Amount"
                            description="Amount of tokens to deposit"
                            placeholder="0"
                            rightSectionWidth={60}
                            rightSection={<Text>{symbol}</Text>}
                            withAsterisk
                            data-testid="amount-input"
                            {...form.getInputProps("amount")}
                        />
                        <Flex
                            mt="-sm"
                            justify={"space-between"}
                            direction={"row"}
                        >
                            <Flex rowGap={6} c={"dark.2"}>
                                <Text fz="xs">Balance:</Text>
                                <Text id="token-balance" fz="xs" mx={4}>
                                    {" "}
                                    {balance !== undefined && decimals
                                        ? formatUnits(balance, decimals)
                                        : ""}
                                </Text>
                                {balance !== undefined &&
                                    balance > 0 &&
                                    decimals && (
                                        <UnstyledButton
                                            fz={"xs"}
                                            c={"cyan"}
                                            onClick={() => {
                                                form.setFieldValue(
                                                    "amount",
                                                    formatUnits(
                                                        balance,
                                                        decimals,
                                                    ),
                                                );
                                            }}
                                            data-testid="max-button"
                                        >
                                            Max
                                        </UnstyledButton>
                                    )}
                            </Flex>
                            <Flex rowGap={6} c={"dark.2"}>
                                <Text size="xs">Allowance:</Text>
                                <Text ml={4} fz="xs">
                                    {allowance != undefined && decimals
                                        ? formatUnits(allowance, decimals)
                                        : ""}
                                </Text>
                            </Flex>
                        </Flex>
                    </Stack>
                </Collapse>
                <Collapse in={advanced}>
                    <Textarea
                        label="Extra data"
                        description="Extra execution layer data handled by the application"
                        {...form.getInputProps("execLayerData")}
                    />
                </Collapse>
                <Collapse in={approve.isLoading || approveWait.isLoading}>
                    <TransactionProgress
                        prepare={approvePrepare}
                        execute={approve}
                        wait={approveWait}
                        confirmationMessage="Approve transaction confirmed"
                    />
                </Collapse>
                <Collapse in={!deposit.isIdle}>
                    <TransactionProgress
                        prepare={depositPrepare}
                        execute={deposit}
                        wait={depositWait}
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
                        disabled={approveDisabled || !needApproval}
                        leftSection={<TbCheck />}
                        loading={approveLoading}
                        onClick={approve.write}
                    >
                        Approve
                    </Button>
                    <Button
                        variant="filled"
                        disabled={
                            depositDisabled || !canDeposit || !form.isValid()
                        }
                        leftSection={<TbPigMoney />}
                        loading={depositLoading}
                        onClick={deposit.write}
                    >
                        Deposit
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
