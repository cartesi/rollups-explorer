import {
    erc20ABI,
    erc20PortalAddress,
    useErc20Approve,
    useErc20PortalDepositErc20Tokens,
    usePrepareErc20Approve,
    usePrepareErc20PortalDepositErc20Tokens,
} from "@cartesi/rollups-wagmi";
import {
    Autocomplete,
    Button,
    Collapse,
    Group,
    Loader,
    Stack,
    Text,
    TextInput,
    Textarea,
    Alert,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {FC, useState} from "react";
import {
    TbChevronDown,
    TbChevronUp,
    TbCheck,
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
import { TransactionStageStatus } from "./TransactionStatus";
import { TransactionProgress } from "./TransactionProgress";

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
    applications: string[],
}

export const ERC20DepositForm: FC<ERC20DepositFormProps> = (props) => {
    const { applications } = props;
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
        <form>
            <Stack>
                <Autocomplete
                    label="Application"
                    description="The application smart contract address"
                    placeholder="0x"
                    data={applications}
                    value={application}
                    withAsterisk
                    onChange={setApplication}
                />

                {application !== '' && !applications.includes(application) && (
                    <Alert variant="light" color="blue">
                        This is a deposit to an undeployed application.
                    </Alert>
                )}

                <TextInput
                    label="ERC-20"
                    description="The ERC-20 smart contract address"
                    placeholder="0x"
                    value={erc20Address}
                    error={erc20Errors[0]}
                    onChange={(e) => {
                        setErc20Address(e.target.value);
                    }}
                    rightSection={erc20.isLoading && <Loader size="xs" />}
                    withAsterisk
                />
                <Collapse in={erc20.isSuccess && erc20Errors.length == 0}>
                    <Stack>
                        <TextInput
                            label="Max amount"
                            description={`Token balance of ${address}`}
                            value={
                                balance != undefined && decimals
                                    ? formatUnits(balance, decimals)
                                    : ""
                            }
                            readOnly
                            error={
                                balance === 0n
                                    ? "Insufficient balance"
                                    : undefined
                            }
                            rightSectionWidth={60}
                            rightSection={<Text>{symbol}</Text>}
                        />
                        <TextInput
                            label="Amount"
                            description="Amount of tokens to deposit"
                            placeholder="0"
                            rightSectionWidth={60}
                            rightSection={<Text>{symbol}</Text>}
                            onChange={(e) => setAmount(e.target.value)}
                            withAsterisk
                        />
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
