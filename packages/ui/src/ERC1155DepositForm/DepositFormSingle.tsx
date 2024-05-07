import {
    erc1155Abi,
    erc1155SinglePortalAddress,
    useReadErc1155BalanceOf,
    useReadErc1155IsApprovedForAll,
    useReadErc1155SupportsInterface,
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
import { FC, useEffect } from "react";
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
    parseUnits,
    zeroAddress,
} from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { interfaceIdForERC1155 } from "../ERC165Identifiers";
import { TransactionProgress } from "../TransactionProgress";
import { transactionState } from "../TransactionState";
import useWatchQueryOnBlockChange from "../hooks/useWatchQueryOnBlockChange";
import AdvancedFields from "./AdvancedFields";
import TokenFields from "./TokenFields";
import { FormProvider, useForm } from "./context";
import { ERC1155DepositFormProps } from "./types";
import {
    amountValidation,
    applicationValidation,
    erc1155AddressValidation,
    hexValidation,
    isValidContractInterface,
    tokenIdValidation,
} from "./validations";

type Props = Omit<ERC1155DepositFormProps, "mode">;

const DepositFormSingle: FC<Props> = (props) => {
    const {
        tokens,
        applications,
        isLoadingApplications,
        onSearchApplications,
        onSearchTokens,
        onSuccess,
    } = props;

    const [advanced, { toggle: toggleAdvanced }] = useDisclosure(false);
    // connected account
    const { address } = useAccount();

    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            mode: "single",
            application: "",
            erc1155Address: "",
            tokenId: "",
            amount: "",
            execLayerData: "0x",
            baseLayerData: "0x",
            decimals: 0,
            balance: 0n,
        },
        validate: {
            application: applicationValidation,
            erc1155Address: erc1155AddressValidation,
            tokenId: tokenIdValidation,
            amount: amountValidation,
            execLayerData: hexValidation,
            baseLayerData: hexValidation,
        },
        transformValues: (values) => ({
            applicationAddress: isAddress(values.application)
                ? getAddress(values.application)
                : zeroAddress,
            erc1155Address: isAddress(values.erc1155Address)
                ? getAddress(values.erc1155Address)
                : zeroAddress,
            tokenId:
                values.tokenId !== "" &&
                Number.isInteger(Number(values.tokenId))
                    ? BigInt(Number(values.tokenId))
                    : undefined,
            amount:
                values.amount !== ""
                    ? parseUnits(values.amount.toString(), values.decimals)
                    : undefined,
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

    const supportsInterface = useReadErc1155SupportsInterface({
        address: erc1155Contract.address,
        args: [interfaceIdForERC1155],
        query: {
            enabled: erc1155Contract.address !== undefined,
        },
    });

    const { isLoading: isCheckingContractInterface } = supportsInterface;
    const validContractResult = isValidContractInterface(supportsInterface);

    const approvedForAll = useReadErc1155IsApprovedForAll({
        address: erc1155Contract.address,
        args: [getAddress(address!), erc1155SinglePortalAddress],
        query: {
            enabled:
                validContractResult.isValid && !isCheckingContractInterface,
        },
    });

    useWatchQueryOnBlockChange(approvedForAll.queryKey);

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
                    isHex(baseLayerData) &&
                    isApproved,
            },
        });

    const deposit = useWriteErc1155SinglePortalDepositSingleErc1155Token();

    const depositWait = useWaitForTransactionReceipt({
        hash: deposit.data,
        query: {
            enabled: isApproved,
        },
    });

    const canDeposit =
        accountBalance !== undefined &&
        amount !== undefined &&
        amount > 0 &&
        amount <= accountBalance &&
        isApproved;

    const { loading: approveLoading } = transactionState(
        approvePrepare,
        approve,
        approveWait,
        true,
    );
    const { disabled: depositDisabled, loading: depositLoading } =
        transactionState(depositPrepare, deposit, depositWait, true);

    useEffect(() => {
        if (depositWait.isSuccess) {
            if (onSuccess)
                onSuccess({ receipt: depositWait.data, type: "ERC-1155" });
            form.reset();
            approve.reset();
            deposit.reset();
        }
    }, [
        depositWait.isSuccess,
        onSuccess,
        approve,
        deposit,
        form,
        depositWait.data,
    ]);

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
                            (isCheckingContractInterface ||
                                isCheckingApproval ||
                                isCheckingBalance) && <Loader size="xs" />
                        }
                        {...form.getInputProps("erc1155Address")}
                        error={
                            validContractResult.errorMessage ||
                            erc1155Errors[0] ||
                            form.errors.erc1155Address
                        }
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
                            !isCheckingContractInterface &&
                            validContractResult.isValid &&
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
                            loading={canDeposit && depositLoading}
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

export default DepositFormSingle;
