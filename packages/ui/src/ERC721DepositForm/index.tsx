import {
    Alert,
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
import { isEmpty, isNotNil } from "ramda";
import { FC, useEffect, useState } from "react";
import {
    TbAlertCircle,
    TbCheck,
    TbChevronDown,
    TbChevronUp,
    TbPigMoney,
} from "react-icons/tb";
import { Hex, getAddress, isAddress, isHex, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import ApplicationAutocomplete from "../ApplicationAutocomplete";
import { TransactionFormSuccessData } from "../DepositFormTypes";
import RollupVersionSegment from "../RollupVersionSegment";
import { TransactionProgress } from "../TransactionProgress";
import { transactionState } from "../TransactionState";
import RollupContract from "../commons/RollupContract";
import { Application, RollupVersion } from "../commons/interfaces";
import useTokensOfOwnerByIndex from "../hooks/useTokensOfOwnerByIndex";
import useUndeployedApplication from "../hooks/useUndeployedApplication";
import { useERC721Approve } from "./hooks/useERC721Approve";
import { useERC721PortalDeposit } from "./hooks/useERC721PortalDeposit";
import { useERC721Reads } from "./hooks/useERC721Reads";

export interface ERC721DepositFormProps {
    applications: Application[];
    isLoadingApplications: boolean;
    onSearchApplications: (
        appAddress: string,
        rollupVersion?: RollupVersion,
    ) => void;
    onSuccess: (receipt: TransactionFormSuccessData) => void;
}

export const ERC721DepositForm: FC<ERC721DepositFormProps> = (props) => {
    const {
        applications,
        isLoadingApplications,
        onSearchApplications,
        onSuccess,
    } = props;
    const [advanced, { toggle: toggleAdvanced }] = useDisclosure(false);
    const { address } = useAccount();
    const [depositedTokens, setDepositedTokens] = useState<bigint[]>([]);
    const [userSelectedAppVersion, setUserSelectedAppVersion] = useState<
        RollupVersion | undefined
    >();

    const form = useForm({
        validateInputOnChange: true,
        initialValues: {
            application: "",
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
                value !== "" && Number(value) > 0 ? null : "Invalid token ID",
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

    const foundAddresses = applications.map((a) => a.address);
    const isUndeployedApp = useUndeployedApplication(
        applicationAddress,
        foundAddresses,
    );

    // The app version checks
    const hasFoundOneApp = applications.length === 1;
    const app = hasFoundOneApp ? applications[0] : undefined;
    const appVersion = app?.rollupVersion || userSelectedAppVersion;

    const { address: erc721PortalAddress } =
        RollupContract.getERC721PortalConfig(appVersion);

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
        args: [erc721PortalAddress!, tokenIdBigInt!],
        isQueryEnabled:
            tokenIdBigInt !== undefined &&
            hasPositiveBalance &&
            isNotNil(erc721PortalAddress),
    });

    const {
        prepare: depositPrepare,
        execute: deposit,
        wait: depositWait,
    } = useERC721PortalDeposit({
        appVersion,
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
        hasPositiveBalance && tokenIdBigInt !== undefined && tokenIdBigInt > 0;

    const tokensOfOwnerByIndex = useTokensOfOwnerByIndex(
        erc721ContractAddress!,
        address!,
        depositedTokens,
    );

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

    useEffect(() => {
        return () => {
            onSearchApplications("");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            onSearchApplications("");
            setUserSelectedAppVersion(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [depositWait, tokenIdBigInt, onSearchApplications, onSuccess]);

    return (
        <form data-testid="erc721-deposit-form">
            <Stack>
                <ApplicationAutocomplete
                    label="Application"
                    description="The application smart contract address"
                    placeholder="0x"
                    applications={applications}
                    withAsterisk
                    data-testid="application"
                    rightSection={isLoadingApplications && <Loader size="xs" />}
                    {...form.getInputProps("application")}
                    onChange={(nextValue) => {
                        form.setFieldValue("application", nextValue);
                        onSearchApplications(nextValue);
                    }}
                    onApplicationSelected={(app) => {
                        form.setFieldValue("application", app.address);
                        onSearchApplications(app.address, app.rollupVersion);
                    }}
                />

                {!form.errors.application &&
                    isUndeployedApp &&
                    !isLoadingApplications && (
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

                <Collapse in={isNotNil(appVersion) && !isLoadingApplications}>
                    {appVersion && (
                        <Stack>
                            <TextInput
                                label="ERC-721"
                                description="The ERC-721 smart contract address"
                                placeholder="0x"
                                withAsterisk
                                rightSection={
                                    erc721.isLoading && <Loader size="xs" />
                                }
                                {...form.getInputProps("erc721Address")}
                                error={
                                    erc721Errors[0] || form.errors.erc721Address
                                }
                                data-testid="erc721Address"
                            />
                            <Collapse
                                in={
                                    erc721.isSuccess && erc721Errors.length == 0
                                }
                            >
                                <Stack>
                                    {tokensOfOwnerByIndex.tokenIds.length >
                                    0 ? (
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
                                            <Text
                                                id="token-balance"
                                                fz="xs"
                                                mx={4}
                                            >
                                                Balance:{" "}
                                                {balance === undefined
                                                    ? ""
                                                    : `${Number(
                                                          balance,
                                                      )} ${symbol}`}
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
                            <Collapse
                                in={approve.isPending || approveWait.isLoading}
                            >
                                <TransactionProgress
                                    prepare={approvePrepare}
                                    execute={approve}
                                    wait={approveWait}
                                    confirmationMessage="Approve transaction confirmed"
                                />
                            </Collapse>
                            <Collapse
                                in={!deposit.isIdle && !isDepositDisabled}
                            >
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
                                    disabled={isApproveDisabled}
                                    leftSection={<TbCheck />}
                                    loading={approveLoading}
                                    onClick={() =>
                                        approve.writeContract(
                                            approvePrepare.data!.request,
                                        )
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
                                        deposit.writeContract(
                                            depositPrepare.data!.request,
                                        )
                                    }
                                >
                                    Deposit
                                </Button>
                            </Group>
                        </Stack>
                    )}
                </Collapse>
            </Stack>
        </form>
    );
};
