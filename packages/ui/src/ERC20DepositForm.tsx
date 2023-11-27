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
import { useDisclosure } from "@mantine/hooks";
import { FC, useState } from "react";
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
    applications: string[];
    isLoadingApplications: boolean;
    onSearchApplications: (applicationId: string) => void;
    tokens: string[];
}

export interface ApplicationAutocompleteProps {
    applications: string[];
    application: string;
    isLoading: boolean;
    onChange: (application: string) => void;
}
export const ApplicationAutocomplete: FC<ApplicationAutocompleteProps> = (
    props,
) => {
    const { applications, application, isLoading, onChange } = props;

    return (
        <>
            <Autocomplete
                label="Application"
                description="The application smart contract address"
                placeholder="0x"
                data={applications}
                value={application}
                withAsterisk
                rightSection={isLoading && <Loader size="xs" />}
                onChange={onChange}
            />

            {application !== "" && !applications.includes(application) && (
                <Alert variant="light" color="yellow" icon={<TbAlertCircle />}>
                    This is a deposit to an undeployed application.
                </Alert>
            )}
        </>
    );
};

export interface TokensAutocompleteProps {
    tokens: string[];
    erc20Address: string;
    error: string;
    isLoading?: boolean;
    onChange: (erc20Address: string) => void;
}

export const TokenAutocomplete: FC<TokensAutocompleteProps> = (props) => {
    const { tokens, erc20Address, error, isLoading = false, onChange } = props;

    return (
        <>
            <Autocomplete
                label="ERC-20"
                description="The ERC-20 smart contract address"
                placeholder="0x"
                data-testid="token-input"
                data={tokens}
                value={erc20Address}
                error={error}
                withAsterisk
                rightSection={isLoading && <Loader size="xs" />}
                onChange={(nextValue) => {
                    const formattedValue = nextValue.substring(
                        nextValue.indexOf("0x"),
                    );
                    onChange(formattedValue);
                }}
            />

            {erc20Address !== "" &&
                !tokens.some((t) => t.includes(erc20Address)) && (
                    <Alert
                        variant="light"
                        color="yellow"
                        icon={<TbAlertCircle />}
                    >
                        This is the first deposit of that token.
                    </Alert>
                )}
        </>
    );
};

export const ERC20DepositForm: FC<ERC20DepositFormProps> = (props) => {
    const {
        applications,
        isLoadingApplications,
        onSearchApplications,
        tokens,
    } = props;
    const [advanced, { toggle: toggleAdvanced }] = useDisclosure(false);

    // connected account
    const { address } = useAccount();

    // state variable for the ERC-20 address
    const [erc20Address, setErc20Address] = useState<string>("");

    // execLayerData state variable
    const [execLayerData, setExecLayerData] = useState<string>("0x");

    // query token information in a multicall
    const erc20Contract = {
        abi: erc20ABI,
        address: isAddress(erc20Address) ? getAddress(erc20Address) : undefined,
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
    const decimals = erc20.data?.[0].result as number | undefined;
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
    // token amount to deposit
    const [amount, setAmount] = useState<string>("");
    const amountBigint =
        decimals && amount ? parseUnits(amount, decimals) : undefined;

    // state variable for the application address
    const [application, setApplication] = useState("");

    // prepare approve transaction
    const approvePrepare = usePrepareErc20Approve({
        address: isAddress(erc20Address) ? getAddress(erc20Address) : undefined,
        args: [erc20PortalAddress, parseUnits(amount, decimals!)],
        enabled:
            amountBigint != undefined &&
            allowance != undefined &&
            amountBigint > allowance,
    });
    const approve = useErc20Approve(approvePrepare.config);
    const approveWait = useWaitForTransaction(approve.data);

    // prepare deposit transaction
    const depositPrepare = usePrepareErc20PortalDepositErc20Tokens({
        args: [
            isAddress(erc20Address) ? getAddress(erc20Address) : "0x",
            isAddress(application) ? getAddress(application) : "0x",
            amountBigint!,
            toHex(execLayerData),
        ],
        enabled:
            amountBigint != undefined &&
            balance != undefined &&
            allowance != undefined &&
            isAddress(erc20Address) &&
            isAddress(application) &&
            isHex(execLayerData) &&
            amountBigint <= balance &&
            amountBigint <= allowance,
    });
    const deposit = useErc20PortalDepositErc20Tokens(depositPrepare.config);
    const depositWait = useWaitForTransaction(deposit.data);

    // true if current allowance is less than the amount to deposit
    const needApproval =
        allowance != undefined &&
        decimals != undefined &&
        allowance < parseUnits(amount, decimals);

    const canDeposit =
        allowance != undefined &&
        balance != undefined &&
        decimals != undefined &&
        parseUnits(amount, decimals) > 0 &&
        parseUnits(amount, decimals) <= allowance &&
        parseUnits(amount, decimals) <= balance;

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
                <ApplicationAutocomplete
                    applications={applications}
                    application={application}
                    isLoading={isLoadingApplications}
                    onChange={(nextValue) => {
                        setApplication(nextValue);
                        onSearchApplications(nextValue);
                    }}
                />

                <TokenAutocomplete
                    tokens={tokens}
                    erc20Address={erc20Address}
                    error={erc20Errors[0]}
                    isLoading={erc20.isLoading}
                    onChange={setErc20Address}
                />

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
                            onChange={(e) => setAmount(e.target.value)}
                            value={amount}
                            withAsterisk
                            data-testid="amount-input"
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
                                            onClick={() =>
                                                setAmount(
                                                    formatUnits(
                                                        balance,
                                                        decimals,
                                                    ),
                                                )
                                            }
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
                        value={execLayerData}
                        error={
                            isHex(execLayerData)
                                ? undefined
                                : "Invalid hex string"
                        }
                        onChange={(e) => setExecLayerData(e.target.value)}
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
                        disabled={depositDisabled || !canDeposit}
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
