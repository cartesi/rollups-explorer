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
import { isNil, isNotEmpty, isNotNil } from "ramda";
import { isFunction, isNotNilOrEmpty } from "ramda-adjunct";
import { Activity, useEffect, useMemo, type FC } from "react";
import { TbExclamationCircle, TbInfoCircle, TbReceipt } from "react-icons/tb";
import type { TransactionReceipt } from "viem";
import { type Hex } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { content } from "../../content";
import TransactionHash from "../TransactionHash";
import OutputExecutionError, {
    type WagmiActionError,
} from "./errors/OutputExecutionError";
import type { VoucherOutput } from "./types";

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
                                        content.output.epoch.nonAcceptedClaim
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
                                <Tooltip label={content.output.txhash}>
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
                                ? content.output.voucher.executed
                                : checkingOutputExecuted
                                  ? content.output.voucher.checking
                                  : prepare.isFetching
                                    ? content.output.voucher.preparing
                                    : content.output.voucher.execute}
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
