"use client";
import type {
    DelegateCallVoucher,
    GetOutputReturnType,
    Notice,
    Output,
    Voucher,
} from "@cartesi/viem";
import {
    useEpoch,
    useReadApplicationWasOutputExecuted,
    useSimulateApplicationExecuteOutput,
    useWriteApplicationExecuteOutput,
} from "@cartesi/wagmi";
import {
    Alert,
    Badge,
    Button,
    Divider,
    Fieldset,
    Group,
    Spoiler,
    Stack,
    Text,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useQueryClient } from "@tanstack/react-query";
import { isNil, isNotEmpty, isNotNil, pathOr } from "ramda";
import { isNotNilOrEmpty, isObj, isString } from "ramda-adjunct";
import { Activity, useEffect, useMemo, type FC } from "react";
import { TbExclamationCircle, TbInfoCircle, TbReceipt } from "react-icons/tb";
import { formatUnits, isHex, type Hex } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useIsSmallDevice } from "../../hooks/useIsSmallDevice";
import { getDecoder } from "../../lib/decoders";
import Address from "../Address";
import { useSelectedNodeConnection } from "../connection/hooks";
import JSONViewer from "../JSONViewer";
import useVoucherDecoder from "../specification/hooks/useVoucherDecoder";
import TransactionHash from "../TransactionHash";
import type { DecoderType } from "../types";

interface OutputViewProps {
    displayAs?: DecoderType;
    output: GetOutputReturnType;
    application: string;
}

type NoticeProps = { decodedData: Notice; decoderType: DecoderType };

const NoticeContent: FC<NoticeProps> = ({ decodedData, decoderType }) => {
    const decoderFn = getDecoder(decoderType);

    return (
        <Fieldset legend="Notice">
            <Spoiler>
                <Text style={{ wordBreak: "break-all" }}>
                    {decoderFn(decodedData.payload)}
                </Text>
            </Spoiler>
        </Fieldset>
    );
};

type VoucherOutput = Omit<Output, "decodedData"> & {
    decodedData: Voucher | DelegateCallVoucher;
};

type VoucherProps = {
    output: VoucherOutput;
    application: string;
    decoderType: DecoderType;
    title?: string;
};

type Proof = { outputIndex: bigint; outputHashesSiblings: Hex[] };

const buildProof = (output: VoucherOutput): Proof => ({
    outputIndex: output.index,
    outputHashesSiblings: output.outputHashesSiblings ?? [],
});

// xxx: Maybe should become an environment var.
const POLLING_INTERVAL_MS = 8000 as const;

const VoucherContent: FC<VoucherProps> = ({
    decoderType,
    output,
    application,
    title = "Voucher",
}) => {
    const decoderFn = getDecoder(decoderType);
    const { isSmallDevice } = useIsSmallDevice();
    const userAccount = useAccount();
    const connectModal = useConnectModal();
    const selectedNode = useSelectedNodeConnection();
    const chainModal = useChainModal();
    const queryClient = useQueryClient();

    const { decodedData, epochIndex } = output;

    const theme = useMantineTheme();
    const epochQuery = useEpoch({ epochIndex, application });
    const hasPayload =
        isHex(decodedData.payload) && decodedData.payload !== "0x";
    const amount = decodedData.type === "Voucher" ? decodedData.value : 0n;
    const hasAmount = amount > 0n;
    const voucherDecodingRes = useVoucherDecoder({ voucher: decodedData });
    const hasDecodedData = isNotNil(voucherDecodingRes.data);
    const isDecodedSelected = decoderType === "decoded";
    const appAddress = application as Hex;

    const isClaimAccepted = epochQuery.data?.status === "CLAIM_ACCEPTED";
    const hasExecutionTransaction = isNotNil(output.executionTransactionHash);

    const wasOutputExecutedQuery = useReadApplicationWasOutputExecuted({
        address: appAddress,
        args: [output.index],
        query: {
            enabled: !hasExecutionTransaction && isNotNil(output.index),
        },
    });

    const {
        data: wasOutputExecuted,
        isFetching: checkingOutputExecuted,
        error: checkingOutputExecutedError,
        refetch: recheckOutputExecuted,
    } = wasOutputExecutedQuery;

    const proof = buildProof(output);

    const hasHashes = isNotEmpty(proof.outputHashesSiblings);
    const canSimulate =
        userAccount.isConnected &&
        !checkingOutputExecuted &&
        wasOutputExecuted === false &&
        hasHashes &&
        isClaimAccepted;

    const prepare = useSimulateApplicationExecuteOutput({
        address: appAddress,
        args: [output.rawData, proof],
        query: {
            enabled: canSimulate,
        },
    });

    const execute = useWriteApplicationExecuteOutput();
    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });

    const isExecutingVoucher = execute.isPending || wait.isFetching;

    const errors = useMemo(() => {
        return [checkingOutputExecutedError, prepare.error].filter(
            isNotNilOrEmpty,
        );
    }, [checkingOutputExecutedError, prepare.error]);

    const hasErrors = errors.length > 0;

    const isExecuteDisabled =
        !isClaimAccepted ||
        checkingOutputExecuted ||
        wasOutputExecuted ||
        prepare.isFetching ||
        hasErrors;

    useEffect(() => {
        if (wait.isSuccess) {
            notifications.show({
                title: "Voucher execution status",
                message: "Executed successfully",
                color: "green",
                withBorder: true,
            });
            execute.reset();
            recheckOutputExecuted();
            // mark outputs as stale to get latest values from rollups-node.
            queryClient.invalidateQueries({ queryKey: ["outputs"] });
        }
    }, [wait.isSuccess, recheckOutputExecuted, execute, queryClient]);

    useEffect(() => {
        let key: unknown;
        // skip invalidation if there is no node-connected or the connected node is a mock.
        if (
            isNotNil(selectedNode) &&
            selectedNode.type !== "system_mock" &&
            !isClaimAccepted
        ) {
            key = setInterval(() => {
                // Invalidation makes the targeted queries stale.
                // It creates a Polling effect.
                queryClient.invalidateQueries({
                    predicate: (query) => {
                        const [baseKey, paramsKey] = query.queryKey;
                        const isEpochQuery =
                            isString(baseKey) && baseKey.includes("epoch");
                        const isMatchingEpochIndex =
                            isObj(paramsKey) &&
                            pathOr("", ["epochIndex"], paramsKey) ===
                                output.epochIndex.toString();

                        return isEpochQuery && isMatchingEpochIndex;
                    },
                });
            }, POLLING_INTERVAL_MS);
        }

        return () => {
            if (isNotNil(key)) {
                console.info(`Clearing the polling.`);
                clearInterval(key as number);
            }
        };
    }, [queryClient, isClaimAccepted, selectedNode, output.epochIndex]);

    return (
        <Fieldset legend={title}>
            <Group gap="xs">
                <Text c="blue">Destination</Text>
                <Address
                    value={decodedData.destination}
                    wrap="nowrap"
                    shorten={isSmallDevice}
                />
            </Group>

            {hasAmount && (
                <Group>
                    <Text c="blue">Amount</Text>
                    <Text>{formatUnits(amount, 18)}</Text>
                </Group>
            )}
            {hasPayload && (
                <>
                    <Divider my="sm" label="payload" labelPosition="center" />
                    <Spoiler
                        hideLabel="Show less"
                        showLabel="Show more"
                        maxHeight={80}
                    >
                        {hasDecodedData && isDecodedSelected ? (
                            <JSONViewer
                                content={voucherDecodingRes.data ?? ""}
                                key={`decoded-view-${output.index}-${decodedData.destination}`}
                            />
                        ) : (
                            <Text style={{ wordBreak: "break-all" }}>
                                {decoderFn(decodedData.payload)}
                            </Text>
                        )}
                    </Spoiler>
                </>
            )}
            <Stack>
                <Divider mt="sm" />

                <Activity mode={!isClaimAccepted ? "visible" : "hidden"}>
                    <Group justify="flex-end">
                        <Badge
                            radius="xs"
                            size="lg"
                            leftSection={
                                <Tooltip
                                    label={
                                        "Once the epoch status become CLAIM_ACCEPTED the voucher will become executable."
                                    }
                                >
                                    <TbInfoCircle
                                        size={theme.other.smIconSize}
                                    />
                                </Tooltip>
                            }
                        >
                            Waiting Claim
                        </Badge>
                    </Group>
                </Activity>

                <Activity mode={isClaimAccepted ? "visible" : "hidden"}>
                    <Group
                        justify={
                            hasExecutionTransaction
                                ? "space-between"
                                : "flex-end"
                        }
                    >
                        {isNotNil(output.executionTransactionHash) && (
                            <Group gap={3}>
                                <Tooltip label="Transaction hash">
                                    <TbReceipt size={theme.other.mdIconSize} />
                                </Tooltip>
                                <TransactionHash
                                    transactionHash={
                                        output.executionTransactionHash
                                    }
                                />
                            </Group>
                        )}
                        <Button
                            disabled={isExecuteDisabled}
                            loading={isExecutingVoucher}
                            onClick={() => {
                                const needSwitchNetwork =
                                    userAccount.isConnected &&
                                    isNil(userAccount.chain);
                                const canSend =
                                    !needSwitchNetwork &&
                                    userAccount.isConnected;

                                if (needSwitchNetwork)
                                    return chainModal.openChainModal?.();

                                if (canSend) {
                                    execute.writeContract(
                                        prepare.data!.request,
                                    );
                                } else {
                                    connectModal.openConnectModal?.();
                                }
                            }}
                        >
                            {wasOutputExecuted
                                ? "Executed"
                                : checkingOutputExecuted
                                  ? "Checking voucher..."
                                  : prepare.isFetching
                                    ? "Preparing voucher..."
                                    : "Execute"}
                        </Button>
                    </Group>
                </Activity>
            </Stack>
            {hasErrors && (
                <Stack py="sm">
                    {errors.map((error) => (
                        <Alert
                            key={error?.message}
                            color="red"
                            title={pathOr("", ["shortMessage"], error)}
                            icon={
                                <TbExclamationCircle
                                    size={theme.other.mdIconSize}
                                />
                            }
                        >
                            {pathOr(
                                "Something went wrong!",
                                ["cause", "data", "errorName"],
                                error,
                            )}
                        </Alert>
                    ))}
                </Stack>
            )}
        </Fieldset>
    );
};

export const OutputView: FC<OutputViewProps> = ({
    displayAs = "raw",
    output,
    application,
}) => {
    const outputType = output.decodedData.type;
    return (
        <>
            {outputType === "Notice" ? (
                <NoticeContent
                    decodedData={output.decodedData}
                    decoderType={displayAs}
                />
            ) : outputType === "Voucher" ? (
                <VoucherContent
                    application={application}
                    output={output as VoucherOutput}
                    decoderType={displayAs}
                />
            ) : outputType === "DelegateCallVoucher" ? (
                <VoucherContent
                    application={application}
                    title="Delegated Call Voucher"
                    output={output as VoucherOutput}
                    decoderType={displayAs}
                />
            ) : null}
        </>
    );
};
