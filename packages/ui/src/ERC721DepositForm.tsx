import {
    erc721Abi,
    erc721PortalAddress,
    useWriteErc721Approve,
    useSimulateErc721Approve,
    useWriteErc721PortalDepositErc721Token,
    useSimulateErc721PortalDepositErc721Token,
} from "@cartesi/rollups-wagmi";
import {
    Alert,
    Autocomplete,
    Button,
    Collapse,
    Flex,
    Group,
    Loader,
    Select,
    Stack,
    Text,
    TextInput,
    Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
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
    zeroAddress,
} from "viem";
import {
    useAccount,
    useReadContracts,
    useWaitForTransactionReceipt,
} from "wagmi";
import { TransactionProgress } from "./TransactionProgress";
import {
    TransactionStageStatus,
    TransactionWaitStatus,
} from "./TransactionStatus";
import useWatchQueryOnBlockChange from "./hooks/useWatchQueryOnBlockChange";
import useUndeployedApplication from "./hooks/useUndeployedApplication";
import useTokensOfOwnerByIndex from "./hooks/useTokensOfOwnerByIndex";

export const transactionButtonState = (
    prepare: TransactionWaitStatus,
    execute: TransactionStageStatus,
    wait: TransactionWaitStatus,
    disableOnSuccess: boolean = true,
) => {
    const loading =
        prepare.fetchStatus === "fetching" ||
        execute.status === "pending" ||
        wait.fetchStatus === "fetching";

    const disabled =
        prepare.error !== null ||
        (disableOnSuccess && wait.status === "success");

    return { loading, disabled };
};

export interface ERC721DepositFormProps {
    applications: string[];
    isLoadingApplications: boolean;
    onSearchApplications: (applicationId: string) => void;
    onDeposit: () => void;
}

export const ERC721DepositForm: FC<ERC721DepositFormProps> = (props) => {
    const {
        applications,
        isLoadingApplications,
        onSearchApplications,
        onDeposit,
    } = props;
    const [advanced, { toggle: toggleAdvanced }] = useDisclosure(false);
    const { address } = useAccount();
    const [depositedTokens, setDepositedTokens] = useState<bigint[]>([]);

    const form = useForm({
        validateInputOnBlur: true,
        initialValues: {
            application: "",
            erc721Address: "",
            tokenId: "",
            baseLayerData: "0x",
            execLayerData: "0x",
        },
        validate: {
            application: (value) =>
                value !== "" && isAddress(value) ? null : "Invalid application",
            erc721Address: (value) =>
                value !== "" ? null : "Invalid ERC-721 address",
            tokenId: (value) =>
                value !== "" && Number(value) > 0 ? null : "Invalid token ID",
            baseLayerData: (value) =>
                isHex(value) ? null : "Invalid hex string",
            execLayerData: (value) =>
                isHex(value) ? null : "Invalid hex string",
        },
        transformValues: (values) => ({
            address: isAddress(values.application)
                ? getAddress(values.application)
                : zeroAddress,
            erc721Address: isAddress(values.erc721Address)
                ? getAddress(values.erc721Address)
                : zeroAddress,
            erc721ContractAddress: isAddress(values.erc721Address)
                ? getAddress(values.erc721Address)
                : undefined,
            tokenIdBigInt:
                values.tokenId !== "" ? BigInt(values.tokenId) : undefined,
            baseLayerData: values.baseLayerData
                ? (values.baseLayerData as Hex)
                : "0x",
            execLayerData: values.execLayerData
                ? (values.execLayerData as Hex)
                : "0x",
        }),
    });

    const {
        address: applicationAddress,
        erc721Address,
        erc721ContractAddress,
        baseLayerData,
        execLayerData,
        tokenIdBigInt,
    } = form.getTransformedValues();

    const erc721Contract = {
        abi: erc721Abi,
        address: erc721ContractAddress,
    };
    const erc721 = useReadContracts({
        contracts: [
            { ...erc721Contract, functionName: "symbol" },
            { ...erc721Contract, functionName: "balanceOf", args: [address!] },
        ],
    });

    useWatchQueryOnBlockChange(erc721.queryKey);

    const symbol = (erc721.data?.[0].result as string | undefined) ?? "";
    const balance = erc721.data?.[1].result as bigint | undefined;
    const erc721Errors = erc721.data
        ? erc721.data
              .filter((d) => d.error instanceof Error)
              .map((d) => (d.error as BaseError).shortMessage)
        : [];
    const hasPositiveBalance = balance !== undefined && balance > 0;

    // prepare approve transaction
    const approvePrepare = useSimulateErc721Approve({
        address: erc721Address,
        args: [erc721PortalAddress, tokenIdBigInt!],
        query: {
            enabled: tokenIdBigInt !== undefined && hasPositiveBalance,
        },
    });
    const approve = useWriteErc721Approve();
    const approveWait = useWaitForTransactionReceipt({
        hash: approve.data,
    });

    // prepare deposit transaction
    const depositPrepare = useSimulateErc721PortalDepositErc721Token({
        args: [
            erc721Address,
            applicationAddress,
            tokenIdBigInt!,
            baseLayerData,
            execLayerData,
        ],
        query: {
            enabled:
                tokenIdBigInt !== undefined &&
                hasPositiveBalance &&
                !form.errors.erc721Address &&
                !form.errors.application &&
                isHex(baseLayerData) &&
                isHex(execLayerData) &&
                approveWait.status === "success",
        },
    });
    const deposit = useWriteErc721PortalDepositErc721Token();
    const depositWait = useWaitForTransactionReceipt({
        hash: deposit.data,
    });
    const needApproval = tokenIdBigInt !== undefined;
    const canDeposit =
        hasPositiveBalance && tokenIdBigInt !== undefined && tokenIdBigInt > 0;

    const tokensOfOwnerByIndex = useTokensOfOwnerByIndex(
        erc721ContractAddress!,
        address!,
        depositedTokens,
    );

    const { disabled: approveDisabled, loading: approveLoading } =
        transactionButtonState(approvePrepare, approve, approveWait, true);
    const { disabled: depositDisabled, loading: depositLoading } =
        transactionButtonState(depositPrepare, deposit, depositWait, true);
    const isDepositDisabled =
        depositDisabled ||
        !canDeposit ||
        !form.isValid() ||
        approveWait.status !== "success";
    const isApproveDisabled =
        approveDisabled || !needApproval || !isDepositDisabled;
    const isUndeployedApp = useUndeployedApplication(
        applicationAddress,
        applications,
    );

    useEffect(() => {
        if (tokensOfOwnerByIndex.tokenIds.length === 0) {
            form.setFieldValue("tokenId", "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokensOfOwnerByIndex]);

    useEffect(() => {
        if (depositWait.isSuccess) {
            setDepositedTokens((tokens) => [
                ...tokens,
                tokenIdBigInt as bigint,
            ]);
            form.reset();
            approve.reset();
            deposit.reset();
            onDeposit();
            onSearchApplications("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [depositWait.isSuccess, tokenIdBigInt, onDeposit, onSearchApplications]);

    return (
        <form data-testid="erc721-deposit-form">
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
                    label="ERC-721"
                    description="The ERC-721 smart contract address"
                    placeholder="0x"
                    withAsterisk
                    data-testid="erc721Address"
                    rightSection={erc721.isLoading && <Loader size="xs" />}
                    {...form.getInputProps("erc721Address")}
                    error={erc721Errors[0] || form.errors.erc721Address}
                />
                <Collapse in={erc721.isSuccess && erc721Errors.length == 0}>
                    <Stack>
                        {tokensOfOwnerByIndex.tokenIds.length > 0 ? (
                            <Select
                                label="Token ID"
                                description="Token ID to deposit"
                                placeholder="Token ID"
                                withAsterisk
                                data-testid="token-id-select"
                                data={tokensOfOwnerByIndex.tokenIds.map(
                                    (tokenId) => ({
                                        value: String(tokenId),
                                        label: String(tokenId),
                                    }),
                                )}
                                onChange={(nextValue) => {
                                    form.setFieldValue(
                                        "tokenId",
                                        nextValue ?? "",
                                    );
                                    approve.reset();
                                    deposit.reset();
                                }}
                            />
                        ) : (
                            <TextInput
                                label="Token ID"
                                description="Token ID to deposit"
                                placeholder="Token ID"
                                withAsterisk
                                data-testid="token-id-input"
                                disabled={!hasPositiveBalance}
                                {...form.getInputProps("tokenId")}
                            />
                        )}

                        <Flex
                            mt="-sm"
                            justify={"space-between"}
                            direction={"row"}
                        >
                            <Flex rowGap={6} c="dark.2">
                                <Text id="token-balance" fz="xs" mx={4}>
                                    Balance:{" "}
                                    {balance === undefined
                                        ? ""
                                        : `${Number(balance)} ${symbol}`}
                                </Text>
                            </Flex>
                        </Flex>
                    </Stack>
                </Collapse>
                <Collapse in={advanced}>
                    <Textarea
                        label="Base data"
                        description="Base execution layer data handled by the application"
                        mb={16}
                        {...form.getInputProps("baseLayerData")}
                    />

                    <Textarea
                        label="Extra data"
                        description="Extra execution layer data handled by the application"
                        {...form.getInputProps("execLayerData")}
                    />
                </Collapse>
                <Collapse in={approve.isPending || approveWait.isLoading}>
                    <TransactionProgress
                        prepare={approvePrepare}
                        execute={approve}
                        wait={approveWait}
                        confirmationMessage="Approve transaction confirmed"
                    />
                </Collapse>
                <Collapse in={!deposit.isIdle && !isDepositDisabled}>
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
                        disabled={isApproveDisabled}
                        leftSection={<TbCheck />}
                        loading={approveLoading}
                        onClick={() =>
                            approve.writeContract(approvePrepare.data!.request)
                        }
                    >
                        Approve
                    </Button>
                    <Button
                        variant="filled"
                        disabled={isDepositDisabled}
                        leftSection={<TbPigMoney />}
                        loading={depositLoading}
                        onClick={() =>
                            deposit.writeContract(depositPrepare.data!.request)
                        }
                    >
                        Deposit
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};
