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
import { isNotNil, isNotNilOrEmpty } from "ramda-adjunct";
import { FC, useEffect, useState } from "react";
import {
    TbAlertCircle,
    TbCheck,
    TbChevronDown,
    TbChevronUp,
    TbPigMoney,
} from "react-icons/tb";
import {
    Hex,
    formatUnits,
    getAddress,
    isAddress,
    isHex,
    parseUnits,
    zeroAddress,
} from "viem";
import { useAccount } from "wagmi";
import ApplicationAutocomplete from "../ApplicationAutocomplete";
import { TransactionFormSuccessData } from "../DepositFormTypes";
import RollupVersionSegment from "../RollupVersionSegment";
import { TransactionProgress } from "../TransactionProgress";
import { transactionState } from "../TransactionState";
import RollupContract from "../commons/RollupContract";
import { Application, RollupVersion } from "../commons/interfaces";
import useUndeployedApplication from "../hooks/useUndeployedApplication";
import { useERC20Approve } from "./hooks/useERC20Approve";
import { useERC20PortalDeposit } from "./hooks/useERC20PortalDeposit";
import { useERC20Reads } from "./hooks/useERC20Reads";
import { FormValues, TransformValues } from "./types";
import { isApprovalNeeded, isReadyToDeposit } from "./utils";

export interface ERC20DepositFormProps {
    tokens: string[];
    applications: Application[];
    isLoadingApplications: boolean;
    onSearchApplications: (
        appAddress: string,
        rollupVersion?: RollupVersion,
    ) => void;
    onSearchTokens: (tokenId: string) => void;
    onSuccess: (receipt: TransactionFormSuccessData) => void;
}

export const ERC20DepositForm: FC<ERC20DepositFormProps> = (props) => {
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

    const form = useForm<FormValues, TransformValues>({
        validateInputOnChange: true,
        initialValues: {
            application: "",
            erc20Address: "",
            amount: "",
            execLayerData: "0x",
        },
        validate: {
            application: (value) => {
                if (isEmpty(value)) return `Application address is required!`;
                if (!isAddress(value)) {
                    return `Invalid Application address`;
                }
                return null;
            },
            erc20Address: (value) => {
                if (isEmpty(value)) return `ERC20 address is required!`;
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
                values.amount !== "" && isNotNil(values.decimals)
                    ? parseUnits(values.amount, values.decimals)
                    : undefined,
            execLayerData: values.execLayerData
                ? (values.execLayerData as Hex)
                : "0x",
        }),
    });

    const {
        address: applicationAddress,
        erc20Address,
        erc20ContractAddress,
        execLayerData,
        amountBigInt,
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

    const { address: erc20PortalAddress } =
        RollupContract.getERC20PortalConfig(appVersion);

    // query token information in a multicall
    const erc20 = useERC20Reads({
        erc20Address: erc20ContractAddress!,
        spenderAddress: erc20PortalAddress!,
        ownerAddress: address!,
    });

    const { allowance, balance, errors: erc20Errors, symbol, decimals } = erc20;
    // prepare approve transaction
    const { approve, approvePrepare, approveWait } = useERC20Approve({
        args: [erc20PortalAddress!, amountBigInt!],
        erc20Address,
        isQueryEnabled:
            isNotNilOrEmpty(erc20PortalAddress) &&
            amountBigInt !== undefined &&
            allowance !== undefined &&
            amountBigInt > 0 &&
            amountBigInt > allowance,
    });

    // prepare deposit transaction
    const {
        prepare: depositPrepare,
        execute: deposit,
        wait: depositWait,
    } = useERC20PortalDeposit({
        appVersion,
        contractParams: {
            args: [
                erc20Address,
                applicationAddress,
                amountBigInt!,
                execLayerData,
            ],
        },
        isQueryEnabled:
            form.isValid() &&
            amountBigInt !== undefined &&
            balance !== undefined &&
            allowance !== undefined &&
            amountBigInt <= balance &&
            amountBigInt <= allowance,
    });

    // true if current allowance is less than the amount to deposit
    const needApproval = isApprovalNeeded({
        erc20Reads: erc20,
        amount: amountBigInt,
    });
    const canDeposit = isReadyToDeposit({
        erc20Reads: erc20,
        amount: amountBigInt,
    });

    const { disabled: approveDisabled, loading: approveLoading } =
        transactionState(approvePrepare, approve, approveWait, false);
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
        const { decimals: formDecimal } = form.getValues();
        if (decimals !== formDecimal) {
            form.setFieldValue("decimals", decimals);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [decimals]);

    useEffect(() => {
        if (depositWait.isSuccess) {
            onSuccess({ receipt: depositWait.data, type: "ERC-20" });
            form.reset();
            approve.reset();
            deposit.reset();
            onSearchApplications("");
            onSearchTokens("");
            setUserSelectedAppVersion(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [depositWait, onSearchApplications, onSuccess]);

    return (
        <form data-testid="erc20-deposit-form">
            <Stack>
                <ApplicationAutocomplete
                    label="Application"
                    description="The application smart contract address"
                    placeholder="0x"
                    applications={applications}
                    withAsterisk
                    data-testid="application-input"
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
                            <Autocomplete
                                label="ERC-20"
                                description="The ERC-20 smart contract address"
                                placeholder="0x"
                                data={tokens}
                                withAsterisk
                                data-testid="erc20address-input"
                                rightSection={
                                    erc20.isLoading && <Loader size="xs" />
                                }
                                {...form.getInputProps("erc20Address")}
                                error={
                                    erc20Errors[0] || form.errors.erc20Address
                                }
                                onChange={(nextValue) => {
                                    const formattedValue = nextValue.substring(
                                        nextValue.indexOf("0x"),
                                    );
                                    form.setFieldValue(
                                        "erc20Address",
                                        formattedValue,
                                    );
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

                            <Collapse
                                in={erc20.isSuccess && erc20Errors.length == 0}
                            >
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
                                            <Text
                                                id="token-balance"
                                                fz="xs"
                                                mx={4}
                                            >
                                                {" "}
                                                {balance !== undefined &&
                                                decimals
                                                    ? formatUnits(
                                                          balance,
                                                          decimals,
                                                      )
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
                                                {allowance != undefined &&
                                                decimals
                                                    ? formatUnits(
                                                          allowance,
                                                          decimals,
                                                      )
                                                    : ""}
                                            </Text>
                                        </Flex>
                                    </Flex>
                                </Stack>
                            </Collapse>
                            <Collapse in={advanced}>
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
                                    disabled={approveDisabled || !needApproval}
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
                    )}
                </Collapse>
            </Stack>
        </form>
    );
};
