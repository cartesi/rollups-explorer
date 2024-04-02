import {
    erc1155Abi,
    erc1155SinglePortalAddress,
    useReadErc1155BalanceOf,
    useReadErc1155IsApprovedForAll,
    useSimulateErc1155SetApprovalForAll,
    useSimulateErc1155SinglePortalDepositSingleErc1155Token,
    useWriteErc1155SetApprovalForAll,
    useWriteErc1155SinglePortalDepositSingleErc1155Token,
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
import { useDisclosure } from "@mantine/hooks";
import { isEmpty } from "ramda";
import { FC } from "react";
import {
    TbAlertCircle,
    TbCheck,
    TbChevronDown,
    TbChevronUp,
    TbPigMoney,
} from "react-icons/tb";
import {
    BaseError,
    Hex,
    getAddress,
    isAddress,
    isHex,
    zeroAddress,
} from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { TransactionProgress } from "../TransactionProgress";
import { transactionState } from "../TransactionState";
import AdvancedFields from "./AdvancedFields";
import TokenFields from "./TokenFields";
import { FormProvider, useForm } from "./context";

export interface ERC1155DepositFormProps {
    tokens: string[];
    applications: string[];
    isLoadingApplications: boolean;
    onSearchApplications: (applicationId: string) => void;
    onSearchTokens: (tokenId: string) => void;
}

export const ERC1155DepositForm: FC<ERC1155DepositFormProps> = (props) => {
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

    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            application: "",
            erc1155Address: "",
            tokenId: "",
            amount: "",
            execLayerData: "0x",
            baseLayerData: "0x",
        },
        validate: {
            application: (value) => {
                if (isEmpty(value)) return `Application address is required.`;
                if (!isAddress(value)) {
                    return `Invalid Application address`;
                }
                return null;
            },
            erc1155Address: (value) => {
                if (isEmpty(value)) return `ERC1155 address is required`;
                if (!isAddress(value)) {
                    return `Invalid ERC1155 address`;
                }
                return null;
            },
            tokenId: (value) =>
                value !== "" && Number(value) >= 0 ? null : "Invalid token id",
            amount: (value) =>
                value !== "" && Number(value) > 0 ? null : "Invalid amount",
            execLayerData: (value) =>
                isHex(value) ? null : "Invalid hex string",
            baseLayerData: (value) =>
                isHex(value) ? null : "Invalid hex string",
        },
        transformValues: (values) => ({
            applicationAddress: isAddress(values.application)
                ? getAddress(values.application)
                : zeroAddress,
            erc1155Address: isAddress(values.erc1155Address)
                ? getAddress(values.erc1155Address)
                : zeroAddress,
            tokenId: values.tokenId ? BigInt(values.tokenId) : undefined,
            amount: values.amount ? BigInt(values.amount) : undefined,
            execLayerData: values.execLayerData as Hex,
            baseLayerData: values.baseLayerData as Hex,
        }),
    });

    const {
        applicationAddress,
        erc1155Address,
        amount,
        tokenId,
        baseLayerData,
        execLayerData,
    } = form.getTransformedValues();

    const erc1155Contract = {
        abi: erc1155Abi,
        address: erc1155Address !== zeroAddress ? erc1155Address : undefined,
    } as const;

    const balanceOf = useReadErc1155BalanceOf({
        address: erc1155Contract.address,
        args: [getAddress(address!), tokenId!],
        query: {
            enabled: tokenId !== undefined,
        },
    });

    const approvedForAll = useReadErc1155IsApprovedForAll({
        address: erc1155Contract.address,
        args: [getAddress(address!), erc1155SinglePortalAddress],
    });

    const { data: accountBalance, isLoading: isCheckingBalance } = balanceOf;
    const { data: isApproved, isLoading: isCheckingApproval } = approvedForAll;

    const erc1155Errors = [approvedForAll, balanceOf]
        .filter((d) => d.isError)
        .map((d) => (d.error as BaseError).shortMessage);

    // prepare approve transaction
    const approvePrepare = useSimulateErc1155SetApprovalForAll({
        address: erc1155Address,
        args: [erc1155SinglePortalAddress, true],
        query: {
            enabled:
                accountBalance !== undefined &&
                amount !== undefined &&
                amount > 0 &&
                amount <= accountBalance,
        },
    });

    const approve = useWriteErc1155SetApprovalForAll();
    const approveWait = useWaitForTransactionReceipt({
        hash: approve.data,
    });

    // prepare deposit transaction
    const depositPrepare =
        useSimulateErc1155SinglePortalDepositSingleErc1155Token({
            args: [
                erc1155Address!,
                applicationAddress,
                tokenId!,
                amount!,
                baseLayerData,
                execLayerData,
            ],
            query: {
                enabled:
                    tokenId !== undefined &&
                    amount !== undefined &&
                    accountBalance !== undefined &&
                    amount <= accountBalance &&
                    !form.errors.application &&
                    !form.errors.erc1155Address &&
                    isHex(execLayerData) &&
                    isHex(baseLayerData),
            },
        });

    const deposit = useWriteErc1155SinglePortalDepositSingleErc1155Token();

    const depositWait = useWaitForTransactionReceipt({
        hash: deposit.data,
    });

    const canDeposit =
        accountBalance !== undefined &&
        amount !== undefined &&
        amount > 0 &&
        amount <= accountBalance;

    const { loading: approveLoading } = transactionState(
        approvePrepare,
        approve,
        approveWait,
        false,
    );
    const { disabled: depositDisabled, loading: depositLoading } =
        transactionState(depositPrepare, deposit, depositWait, true);

    return (
        <FormProvider form={form}>
            <form data-testid="erc1155-deposit-form">
                <Stack>
                    <Autocomplete
                        label="Application"
                        description="The application smart contract address"
                        placeholder="0x"
                        data={applications}
                        withAsterisk
                        data-testid="application"
                        rightSection={
                            isLoadingApplications && <Loader size="xs" />
                        }
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
                        label="ERC-1155"
                        description="The ERC-1155 smart contract address"
                        placeholder="0x"
                        data={tokens}
                        withAsterisk
                        data-testid="erc1155Address"
                        rightSection={
                            (isCheckingApproval || isCheckingBalance) && (
                                <Loader size="xs" />
                            )
                        }
                        {...form.getInputProps("erc1155Address")}
                        error={erc1155Errors[0] || form.errors.erc1155Address}
                        onChange={(nextValue) => {
                            const formattedValue = nextValue.substring(
                                nextValue.indexOf("0x"),
                            );
                            form.setFieldValue(
                                "erc1155Address",
                                formattedValue,
                            );
                            form.setValues({ amount: "", tokenId: "" });
                            onSearchTokens(formattedValue);
                        }}
                    />

                    <TokenFields
                        balanceOf={balanceOf}
                        display={
                            erc1155Address !== zeroAddress &&
                            isAddress(erc1155Address)
                        }
                    />

                    <AdvancedFields display={advanced} />

                    <Collapse in={!approve.isIdle || approveWait.isLoading}>
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
                            disabled={isApproved || !form.isValid()}
                            leftSection={<TbCheck />}
                            loading={isCheckingApproval || approveLoading}
                            onClick={() =>
                                approve.writeContract(
                                    approvePrepare.data!.request,
                                )
                            }
                        >
                            {!isCheckingApproval && isApproved
                                ? "Approved"
                                : "Approve"}
                        </Button>
                        <Button
                            variant="filled"
                            disabled={
                                depositDisabled ||
                                !canDeposit ||
                                !form.isValid()
                            }
                            leftSection={<TbPigMoney />}
                            loading={depositLoading}
                            onClick={() =>
                                deposit.writeContract(
                                    depositPrepare.data!.request,
                                )
                            }
                        >
                            Deposit
                        </Button>
                    </Group>
                </Stack>
            </form>
        </FormProvider>
    );
};
