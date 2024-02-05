import {
    erc721ABI,
    erc721PortalAddress,
    useErc721Approve,
    useErc721PortalDepositErc721Token,
    usePrepareErc721Approve,
    usePrepareErc721PortalDepositErc721Token,
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
    Textarea,
    TextInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    TbAlertCircle,
    TbCheck,
    TbChevronDown,
    TbChevronUp,
    TbPigMoney,
} from "react-icons/tb";
import {
    BaseError,
    getAddress,
    isAddress,
    isHex,
    toHex,
    zeroAddress,
} from "viem";
import {
    Address,
    useAccount,
    useContractReads,
    useWaitForTransaction,
} from "wagmi";
import { TransactionProgress } from "./TransactionProgress";
import { TransactionStageStatus } from "./TransactionStatus";

const erc721AbiEnumerable = [
    ...erc721ABI,
    {
        stateMutability: "view",
        type: "function",
        inputs: [
            {
                name: "owner",
                type: "address",
            },
            {
                name: "index",
                type: "uint256",
            },
        ],
        name: "tokenOfOwnerByIndex",
        outputs: [
            {
                name: "tokenId",
                type: "uint256",
            },
        ],
    },
] as const;

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

export const useTokensOfOwnerByIndex = (
    erc721ContractAddress: Address,
    ownerAddress: Address,
) => {
    const [index, setIndex] = useState(0);
    const [tokenIds, setTokenIds] = useState<bigint[]>([]);
    const [fetching, setFetching] = useState(true);
    const lastErc721ContractAddress = useRef(erc721ContractAddress);
    const lastOwnerAddress = useRef(ownerAddress);
    const erc721Contract = {
        abi: erc721AbiEnumerable,
        address: erc721ContractAddress,
    };
    const isEnabled =
        erc721ContractAddress?.toString() !== "" &&
        ownerAddress?.toString() !== "";
    const erc721 = useContractReads({
        contracts: [
            {
                ...erc721Contract,
                functionName: "tokenOfOwnerByIndex",
                args: [ownerAddress!, BigInt(index)],
            },
        ],
        enabled: isEnabled,
        watch: true,
    });
    const tokenOfOwnerByIndex = erc721.data?.[0];

    const onChange = useCallback(() => {
        const isExisting =
            erc721ContractAddress === lastErc721ContractAddress.current &&
            ownerAddress === lastOwnerAddress.current;

        lastErc721ContractAddress.current = erc721ContractAddress;
        lastOwnerAddress.current = ownerAddress;

        if (tokenOfOwnerByIndex?.status === "success") {
            setTokenIds((prevTokenIds) =>
                isExisting
                    ? [...prevTokenIds, tokenOfOwnerByIndex.result as bigint]
                    : [tokenOfOwnerByIndex.result as bigint],
            );
            setIndex((prevIndex) => (isExisting ? prevIndex + 1 : 1));
            setFetching(true);
        } else {
            setTokenIds((prevTokenIds) => (isExisting ? prevTokenIds : []));
            setIndex((prevIndex) => (isExisting ? prevIndex : 0));
            setFetching(false);
        }
    }, [tokenOfOwnerByIndex, erc721ContractAddress, ownerAddress]);

    useEffect(() => {
        onChange();
    }, [onChange]);

    return useMemo(
        () => ({
            tokenIds,
            fetching,
        }),
        [tokenIds, fetching],
    );
};

export interface ERC721DepositFormProps {
    applications: string[];
    isLoadingApplications: boolean;
    onSearchApplications: (applicationId: string) => void;
}

export const ERC721DepositForm: FC<ERC721DepositFormProps> = (props) => {
    const { applications, isLoadingApplications, onSearchApplications } = props;
    const [advanced, { toggle: toggleAdvanced }] = useDisclosure(false);
    const { address } = useAccount();
    const resetTimeout = useRef<NodeJS.Timeout | null>(null);

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
            baseLayerData: toHex(values.baseLayerData),
            execLayerData: toHex(values.execLayerData),
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
        abi: erc721ABI,
        address: erc721ContractAddress,
    };
    const erc721 = useContractReads({
        contracts: [
            { ...erc721Contract, functionName: "symbol" },
            { ...erc721Contract, functionName: "balanceOf", args: [address!] },
        ],
        watch: true,
    });

    const tokensOfOwnerByIndex = useTokensOfOwnerByIndex(
        erc721ContractAddress!,
        address!,
    );

    const symbol = (erc721.data?.[0].result as string | undefined) ?? "";
    const balance = erc721.data?.[1].result as bigint | undefined;
    const erc721Errors = erc721.data
        ? erc721.data
              .filter((d) => d.error instanceof Error)
              .map((d) => (d.error as BaseError).shortMessage)
        : [];
    const hasPositiveBalance = balance !== undefined && balance > 0;

    // prepare approve transaction
    const approvePrepare = usePrepareErc721Approve({
        address: erc721Address,
        args: [erc721PortalAddress, tokenIdBigInt!],
        enabled: tokenIdBigInt !== undefined && hasPositiveBalance,
    });
    const approve = useErc721Approve(approvePrepare.config);
    const approveWait = useWaitForTransaction(approve.data);

    // prepare deposit transaction
    const depositPrepare = usePrepareErc721PortalDepositErc721Token({
        args: [
            erc721Address,
            applicationAddress,
            tokenIdBigInt!,
            baseLayerData,
            execLayerData,
        ],
        enabled:
            tokenIdBigInt !== undefined &&
            hasPositiveBalance &&
            !form.errors.erc721Address &&
            !form.errors.application &&
            isHex(baseLayerData) &&
            isHex(execLayerData) &&
            approveWait.status === "success",
    });
    const deposit = useErc721PortalDepositErc721Token(depositPrepare.config);
    const depositWait = useWaitForTransaction(deposit.data);
    const needApproval = tokenIdBigInt !== undefined;
    const canDeposit =
        hasPositiveBalance && tokenIdBigInt !== undefined && tokenIdBigInt > 0;

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

    useEffect(() => {
        if (tokensOfOwnerByIndex.tokenIds.length === 0) {
            form.setFieldValue("tokenId", "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokensOfOwnerByIndex]);

    useEffect(() => {
        if (depositWait.status === "success") {
            form.reset();

            const delay = 3000;
            resetTimeout.current = setTimeout(() => {
                approve.reset();
                deposit.reset();
            }, delay);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [depositWait.status]);

    useEffect(() => {
        const timeout = resetTimeout.current;
        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
        };
    }, []);

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

                {!form.errors.application &&
                    applicationAddress !== zeroAddress &&
                    !applications.some(
                        (a) =>
                            a.toLowerCase() ===
                            applicationAddress.toLowerCase(),
                    ) && (
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
                                {...form.getInputProps("tokenId")}
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
                                    Balance: {Number(balance)} {symbol}
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
