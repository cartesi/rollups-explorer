"use client";
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
    Group,
    Stack,
    Tooltip,
    useMantineTheme,
} from "@mantine/core";
import { useChainModal, useConnectModal } from "@rainbow-me/rainbowkit";
import { useQueryClient } from "@tanstack/react-query";
import { isNil, isNotEmpty, isNotNil, pathOr } from "ramda";
import { isFunction, isNotNilOrEmpty, isObj, isString } from "ramda-adjunct";
import { Activity, useEffect, useMemo, type FC } from "react";
import { TbExclamationCircle, TbInfoCircle, TbReceipt } from "react-icons/tb";
import type { TransactionReceipt } from "viem";
import { type Hex } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useSelectedNodeConnection } from "../connection/hooks";
import TransactionHash from "../TransactionHash";
import OutputExecutionError, {
    type WagmiActionError,
} from "./errors/OutputExecutionError";
import type { VoucherOutput } from "./types";

// xxx: Maybe should become an environment var.
const POLLING_INTERVAL_MS = 8000 as const;

type OutputExecutionProps = {
    output: VoucherOutput;
    application: Hex;
    onSuccess?: (txReceipt: TransactionReceipt) => void;
    onError?: (errors: OutputExecutionError[]) => void;
};

type Proof = { outputIndex: bigint; outputHashesSiblings: Hex[] };

const buildProof = (output: VoucherOutput): Proof => ({
    outputIndex: output.index,
    outputHashesSiblings: output.outputHashesSiblings ?? [],
});

const OutputExecution: FC<OutputExecutionProps> = ({
    application,
    output,
    onSuccess,
    onError,
}) => {
    const theme = useMantineTheme();
    const userAccount = useAccount();
    const connectModal = useConnectModal();
    const selectedNode = useSelectedNodeConnection();
    const chainModal = useChainModal();
    const epochQuery = useEpoch({ epochIndex: output.epochIndex, application });
    const queryClient = useQueryClient();
    const isClaimAccepted = epochQuery.data?.status === "CLAIM_ACCEPTED";
    const hasExecutionTransaction = isNotNil(output.executionTransactionHash);

    const wasOutputExecutedQuery = useReadApplicationWasOutputExecuted({
        address: application,
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
    // L2 response has priority as currently we don't check on L1 if output was executed
    // in case it returns the execution-transaction hash, we consider the output as executed.
    const isExecuted = hasExecutionTransaction || wasOutputExecuted === true;

    const hasHashes = isNotEmpty(proof.outputHashesSiblings);
    const canSimulate =
        userAccount.isConnected &&
        !checkingOutputExecuted &&
        wasOutputExecuted === false &&
        hasHashes &&
        isClaimAccepted;

    const prepare = useSimulateApplicationExecuteOutput({
        address: application,
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
        return [checkingOutputExecutedError, prepare.error]
            .filter(isNotNilOrEmpty)
            .map(
                (wagmiError) =>
                    new OutputExecutionError({
                        type: "wagmi-error",
                        error: wagmiError as WagmiActionError,
                    }),
            );
    }, [checkingOutputExecutedError, prepare.error]);

    const hasErrors = errors.length > 0;

    const isExecuteDisabled =
        !isClaimAccepted ||
        checkingOutputExecuted ||
        isExecuted ||
        prepare.isFetching ||
        hasErrors;

    useEffect(() => {
        if (wait.isSuccess) {
            if (isFunction(onSuccess)) {
                onSuccess(wait.data);
            }
            execute.reset();
            recheckOutputExecuted();
            // mark outputs as stale to get latest values from rollups-node.
            queryClient.invalidateQueries({ queryKey: ["outputs"] });
        }
    }, [
        wait.isSuccess,
        wait.data,
        recheckOutputExecuted,
        execute,
        queryClient,
        onSuccess,
    ]);

    useEffect(() => {
        if (!isFunction(onError)) return;

        if (errors.length > 0) {
            onError(errors);
        }
    }, [errors, onError]);

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
        <>
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
                                <Tooltip label="Execution transaction hash">
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
                            {isExecuted
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
                            key={error.message}
                            color="red"
                            title={error.message}
                            icon={
                                <TbExclamationCircle
                                    size={theme.other.mdIconSize}
                                />
                            }
                        >
                            {error.shortMessage}
                        </Alert>
                    ))}
                </Stack>
            )}
        </>
    );
};

export default OutputExecution;
