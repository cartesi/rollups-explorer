import type { Application } from "@cartesi/viem";
import { erc721PortalAddress } from "@cartesi/wagmi";
import {
    Button,
    Collapse,
    Flex,
    Group,
    Loader,
    NumberInput,
    Select,
    Stack,
    Text,
    TextInput,
    Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { isEmpty } from "ramda";
import { type FC, useEffect, useMemo, useState } from "react";
import {
    TbCheck,
    TbChevronDown,
    TbChevronUp,
    TbPigMoney,
} from "react-icons/tb";
import { type Hex, getAddress, isAddress, isHex, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import type { TransactionFormSuccessData } from "../DepositFormTypes";
import TransactionDetails from "../TransactionDetails";
import { TransactionProgress } from "../TransactionProgress";
import { transactionState } from "../TransactionState";
import useTokensOfOwnerByIndex from "../hooks/useTokensOfOwnerByIndex";
import { useERC721Approve } from "./hooks/useERC721Approve";
import { useERC721PortalDeposit } from "./hooks/useERC721PortalDeposit";
import { useERC721Reads } from "./hooks/useERC721Reads";

export interface ERC721DepositFormProps {
    application: Application;
    onSuccess: (receipt: TransactionFormSuccessData) => void;
}

export const ERC721DepositForm: FC<ERC721DepositFormProps> = (props) => {
    const { application, onSuccess } = props;
    const [advanced, { toggle: toggleAdvanced }] = useDisclosure(false);
    const { address } = useAccount();
    const [depositedTokens, setDepositedTokens] = useState<bigint[]>([]);

    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            application: application.applicationAddress,
            erc721Address: "",
            tokenId: "",
            baseLayerData: "0x",
            execLayerData: "0x",
        },
        validate: {
            application: (value) => {
                if (isEmpty(value)) return "Application address is required!";
                if (!isAddress(value)) return "Invalid application address";
                return null;
            },
            erc721Address: (value) => {
                if (isEmpty(value)) return "ERC-721 address is required!";
                if (!isAddress(value)) return "Invalid ERC-721 address";
                return null;
            },
            tokenId: (value) =>
                value !== "" && Number(value) >= 0 ? null : "Invalid token ID",
            baseLayerData: (value) =>
                isHex(value) ? null : "Base data must be a valid hex string!",
            execLayerData: (value) =>
                isHex(value) ? null : "Extra data must be a valid hex string!",
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

    const erc721 = useERC721Reads({
        erc721Address: erc721ContractAddress!,
        ownerAddress: address!,
    });

    const {
        symbol,
        balance,
        errors: erc721Errors,
        hasPositiveBalance,
    } = erc721;

    const { approve, approvePrepare, approveWait } = useERC721Approve({
        erc721Address,
        args: [erc721PortalAddress, tokenIdBigInt!],
        isQueryEnabled: tokenIdBigInt !== undefined && hasPositiveBalance,
    });

    const {
        prepare: depositPrepare,
        execute: deposit,
        wait: depositWait,
    } = useERC721PortalDeposit({
        contractParams: {
            args: [
                erc721Address,
                applicationAddress,
                tokenIdBigInt!,
                baseLayerData,
                execLayerData,
            ],
        },
        isQueryEnabled:
            tokenIdBigInt !== undefined &&
            hasPositiveBalance &&
            !form.errors.erc721Address &&
            !form.errors.application &&
            isHex(baseLayerData) &&
            isHex(execLayerData) &&
            approveWait.status === "success",
    });

    const needApproval = tokenIdBigInt !== undefined && hasPositiveBalance;
    const canDeposit =
        hasPositiveBalance && tokenIdBigInt !== undefined && tokenIdBigInt >= 0;

    const tokensOfOwnerByIndex = useTokensOfOwnerByIndex(
        erc721ContractAddress!,
        address!,
        depositedTokens,
    );

    // const { data, status, error } = approvePrepare;

    const { disabled: approveDisabled, loading: approveLoading } =
        transactionState(approvePrepare, approve, approveWait, true);
    const { disabled: depositDisabled, loading: depositLoading } =
        transactionState(depositPrepare, deposit, depositWait, true);
    const isDepositDisabled =
        depositDisabled ||
        !canDeposit ||
        !form.isValid() ||
        approveWait.status !== "success";
    const isApproveDisabled =
        approveDisabled || !needApproval || !isDepositDisabled;

    const txDetails = useMemo(
        () => [
            {
                legend: "Application Address",
                text: application.applicationAddress,
            },
            {
                legend: "Portal Address",
                text: erc721PortalAddress,
            },
        ],
        [application.applicationAddress],
    );

    useEffect(() => {
        if (tokensOfOwnerByIndex.tokenIds.length === 0) {
            form.setFieldValue("tokenId", "");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokensOfOwnerByIndex]);

    useEffect(() => {
        if (depositWait.isSuccess) {
            onSuccess({ receipt: depositWait.data, type: "ERC-721" });
            setDepositedTokens((tokens) => [
                ...tokens,
                tokenIdBigInt as bigint,
            ]);
            form.reset();
            approve.reset();
            deposit.reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [depositWait, tokenIdBigInt, onSuccess]);

    return (
        <form data-testid="erc721-deposit-form">
            <Stack>
                <TransactionDetails details={txDetails} />
                <TextInput
                    label="ERC-721"
                    description="The ERC-721 smart contract address"
                    placeholder="0x"
                    withAsterisk
                    rightSection={erc721.isLoading && <Loader size="xs" />}
                    {...form.getInputProps("erc721Address")}
                    error={erc721Errors[0] || form.errors.erc721Address}
                    data-testid="erc721Address"
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
                            <NumberInput
                                label="Token ID"
                                description="Token ID to deposit"
                                placeholder="Token ID"
                                allowNegative={false}
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
                        data-testid="base-data-input"
                        description="Base execution layer data handled by the application"
                        mb={16}
                        {...form.getInputProps("baseLayerData")}
                    />

                    <Textarea
                        label="Extra data"
                        data-testid="extra-data-input"
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
