import {
    erc1155Abi,
    useReadErc1155BalanceOf,
    useReadErc1155IsApprovedForAll,
    useReadErc1155SupportsInterface,
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
import { isEmpty, isNotNil, pipe, reduce, transpose } from "ramda";
import { isNotNilOrEmpty } from "ramda-adjunct";
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
    Hex,
    getAddress,
    isAddress,
    isHex,
    parseUnits,
    zeroAddress,
} from "viem";
import { useAccount } from "wagmi";
import ApplicationAutocomplete from "../ApplicationAutocomplete";
import { interfaceIdForERC1155 } from "../ERC165Identifiers";
import RollupVersionSegment from "../RollupVersionSegment";
import { TransactionProgress } from "../TransactionProgress";
import { transactionState } from "../TransactionState";
import RollupContract from "../commons/RollupContract";
import { RollupVersion } from "../commons/interfaces";
import useUndeployedApplication from "../hooks/useUndeployedApplication";
import useWatchQueryOnBlockChange from "../hooks/useWatchQueryOnBlockChange";
import AdvancedFields from "./AdvancedFields";
import DepositBatchReview from "./DepositBatchReview";
import TokenFields from "./TokenFields";
import {
    BatchTuple,
    DepositData,
    DepositDataTuple,
    FormProvider,
    useForm,
} from "./context";
import { useERC1155ApproveForAll } from "./hooks/useERC1155ApproveForAll";
import { useERC1155BatchPortalDeposit } from "./hooks/useERC1155BatchPortalDeposit";
import { ERC1155DepositFormProps } from "./types";
import {
    amountValidation,
    applicationValidation,
    batchValidation,
    erc1155AddressValidation,
    hexValidation,
    isValidContractInterface,
    tokenIdValidation,
} from "./validations";

type Props = Omit<ERC1155DepositFormProps, "mode">;

const reducer = reduce<DepositData, DepositDataTuple[]>(
    (acc, curr) => [...acc, [curr.tokenId, curr.amount]],
    [] as DepositDataTuple[],
);

const splitBatchInOrder = pipe(reducer, (l) => transpose(l) as BatchTuple);

const DepositFormBatch: FC<Props> = (props) => {
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
    const [userSelectedAppVersion, setUserSelectedAppVersion] = useState<
        RollupVersion | undefined
    >();

    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            mode: "batch",
            application: "",
            erc1155Address: "",
            tokenId: "",
            amount: "",
            execLayerData: "0x",
            baseLayerData: "0x",
            decimals: 0,
            balance: 0n,
            batch: undefined,
        },
        validate: {
            application: applicationValidation,
            erc1155Address: erc1155AddressValidation,
            tokenId: tokenIdValidation,
            amount: amountValidation,
            execLayerData: hexValidation,
            baseLayerData: hexValidation,
            batch: batchValidation,
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
            batchAsLists:
                values.batch && !isEmpty(values.batch)
                    ? splitBatchInOrder(values.batch)
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
        batchAsLists,
    } = form.getTransformedValues();

    const foundAddresses = applications.map((a) => a.address);
    const isUndeployedApp = useUndeployedApplication(
        applicationAddress,
        foundAddresses,
    );

    // The app version checks
    const hasFoundOneApp = applications.length === 1;
    const app = hasFoundOneApp ? applications[0] : undefined;
    const appVersion = app?.rollupVersion || userSelectedAppVersion;

    const { address: erc1155BatchPortalAddress } =
        RollupContract.getERC1155BatchPortalConfig(appVersion);

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
    const isValidContractResult = isValidContractInterface(supportsInterface);

    const approvedForAll = useReadErc1155IsApprovedForAll({
        address: erc1155Contract.address,
        args: [getAddress(address!), erc1155BatchPortalAddress!],
        query: {
            enabled:
                isNotNil(erc1155BatchPortalAddress) &&
                isValidContractResult.isValid &&
                !isCheckingContractInterface,
        },
    });

    useWatchQueryOnBlockChange(approvedForAll.queryKey);

    const { data: accountBalance, isLoading: isCheckingBalance } = balanceOf;
    const { data: isApproved, isLoading: isCheckingApproval } = approvedForAll;

    const erc1155Errors = [approvedForAll, balanceOf]
        .filter((d) => d.isError)
        .map((d) => (d.error as BaseError).shortMessage);

    // prepare approve transaction
    const { approve, approvePrepare, approveWait } = useERC1155ApproveForAll({
        erc1155Address,
        args: [erc1155BatchPortalAddress!, true],
        isQueryEnabled:
            isNotNil(erc1155BatchPortalAddress) &&
            isNotNil(accountBalance) &&
            isNotNil(amount) &&
            amount > 0 &&
            amount <= accountBalance,
    });

    const [tokenIds, amounts] = batchAsLists ?? [];
    const { deposit, depositPrepare, depositWait } =
        useERC1155BatchPortalDeposit({
            appVersion,
            contractParams: {
                args: [
                    erc1155Address,
                    applicationAddress,
                    tokenIds!,
                    amounts!,
                    baseLayerData,
                    execLayerData,
                ],
            },
            isQueryEnabled:
                isNotNilOrEmpty(tokenIds) &&
                isNotNilOrEmpty(amounts) &&
                !form.errors.application &&
                !form.errors.erc1155Address &&
                !form.errors.batch &&
                isHex(execLayerData) &&
                isHex(baseLayerData) &&
                isApproved === true,
        });

    const hasDeposits = isNotNilOrEmpty(tokenIds) && isNotNilOrEmpty(amounts);
    const extraDataIsValid =
        form.isValid("execLayerData") && form.isValid("baseLayerData");

    const canDeposit = hasDeposits && isApproved && extraDataIsValid;
    const needApproval = hasDeposits && !isApproved;
    const showUndeployedSection =
        !form.errors.application &&
        applicationAddress !== zeroAddress &&
        isUndeployedApp &&
        !isLoadingApplications;
    const showERC1155Section = isNotNil(appVersion) && !isLoadingApplications;

    const { loading: approveLoading } = transactionState(
        approvePrepare,
        approve,
        approveWait,
        true,
    );
    const { disabled: depositDisabled, loading: depositLoading } =
        transactionState(depositPrepare, deposit, depositWait, true);

    useEffect(() => {
        return () => {
            onSearchApplications("");
            onSearchTokens("");
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (depositWait.isSuccess) {
            onSuccess({ receipt: depositWait.data, type: "ERC-1155" });
            form.reset();
            approve.reset();
            deposit.reset();
            onSearchApplications("");
            onSearchTokens("");
            setUserSelectedAppVersion(undefined);
        }
    }, [
        depositWait.isSuccess,
        onSuccess,
        approve,
        deposit,
        form,
        depositWait.data,
        onSearchApplications,
        onSearchTokens,
    ]);

    return (
        <FormProvider form={form}>
            <form data-testid="erc1155-batch-deposit-form">
                <Stack>
                    <ApplicationAutocomplete
                        label="Application"
                        description="The application smart contract address"
                        placeholder="0x"
                        applications={applications}
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
                        onApplicationSelected={(app) => {
                            form.setFieldValue("application", app.address);
                            onSearchApplications(
                                app.address,
                                app.rollupVersion,
                            );
                        }}
                    />

                    {showUndeployedSection && (
                        <>
                            <Alert
                                variant="light"
                                color="yellow"
                                icon={<TbAlertCircle />}
                            >
                                This is a deposit to an undeployed application.
                            </Alert>
                            <RollupVersionSegment
                                label="Cartesi Rollups version"
                                description="Set the rollup version to call the correct contracts."
                                onChange={setUserSelectedAppVersion}
                                value={userSelectedAppVersion ?? ""}
                                onUnmount={() => {
                                    setUserSelectedAppVersion(undefined);
                                }}
                            />
                        </>
                    )}

                    {appVersion && (
                        <Collapse in={showERC1155Section}>
                            <Stack>
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
                                            isCheckingBalance) && (
                                            <Loader size="xs" />
                                        )
                                    }
                                    {...form.getInputProps("erc1155Address")}
                                    error={
                                        isValidContractResult.errorMessage ||
                                        erc1155Errors[0] ||
                                        form.errors.erc1155Address
                                    }
                                    onChange={(nextValue) => {
                                        const formattedValue =
                                            nextValue.substring(
                                                nextValue.indexOf("0x"),
                                            );
                                        form.setFieldValue(
                                            "erc1155Address",
                                            formattedValue,
                                        );
                                        form.setFieldValue("amount", "");
                                        form.setFieldValue("tokenId", "");
                                        form.setFieldValue("batch", undefined);
                                        onSearchTokens(formattedValue);
                                    }}
                                />

                                <TokenFields
                                    balanceOf={balanceOf}
                                    display={
                                        erc1155Address !== zeroAddress &&
                                        !isCheckingContractInterface &&
                                        isValidContractResult.isValid &&
                                        isAddress(erc1155Address)
                                    }
                                />

                                <DepositBatchReview />

                                <AdvancedFields display={advanced} />

                                <Collapse
                                    in={
                                        !approve.isIdle || approveWait.isLoading
                                    }
                                >
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
                                            advanced ? (
                                                <TbChevronUp />
                                            ) : (
                                                <TbChevronDown />
                                            )
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
                                        disabled={!needApproval}
                                        leftSection={<TbCheck />}
                                        loading={
                                            isCheckingApproval || approveLoading
                                        }
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
                                            depositDisabled || !canDeposit
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
                        </Collapse>
                    )}
                </Stack>
            </form>
        </FormProvider>
    );
};

export default DepositFormBatch;
