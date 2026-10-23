"use client";
import type { EpochStatus, Input } from "@cartesi/client";
import {
    useSimulateIApplicationIssueRefund,
    useWriteIApplicationIssueRefund,
} from "@cartesi/react";
import { isNil, isNotNil } from "ramda";
import { useEffect, useMemo, useRef, type FC } from "react";
import type { Address } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import { useRefundAsset } from "./hooks/useRefundAssets";
import { useRefundStatus } from "./hooks/useRefundStatus";
import {
    getRevertErrorName,
    getRevertReason,
    isUserRejection,
} from "../../lib/contractErrors";
import {
    decodeDepositInput,
    isRefundableEpoch,
    refundErrorMessage,
    refundStatusFromRead,
    toRefundAsset,
    type RefundStatus,
} from "./lib/refundUtils";
import { useTransactionSender } from "../transactions/hooks/useTransactionSender";
import { RefundDepositView } from "./RefundDepositView";

export interface RefundDepositActionProps {
    application: Address;

    input: Input;

    /** An accepted epoch was processed by the application: nothing is rendered for it. */
    epochStatus?: EpochStatus;

    /** Called once the refund transaction is confirmed. */
    onRefunded?: () => void;
}

/** Permissionless `issueRefund` for a deposit input of a foreclosed application. Renders nothing for non-deposits, processed epochs and the mocked connection. */
export const RefundDepositAction: FC<RefundDepositActionProps> = ({
    application,
    input,
    epochStatus,
    onRefunded,
}) => {
    const deposit = useMemo(() => decodeDepositInput(input), [input]);
    const sender = useTransactionSender();
    const refundableEpoch =
        isNil(epochStatus) || isRefundableEpoch(epochStatus);
    const enabled = isNotNil(deposit) && !sender.hidden && refundableEpoch;

    const refund = useRefundStatus(application, input.index, { enabled });
    const asset = useRefundAsset(deposit ? toRefundAsset(deposit) : undefined, {
        enabled,
    });
    const statusFailed = isNotNil(refund.error) && !refund.isFetching;
    const baseStatus = refundStatusFromRead(refund.refundIssued, statusFailed);

    const prepare = useSimulateIApplicationIssueRefund({
        address: application,
        args: [input.index, input.rawData],
        query: {
            enabled: enabled && sender.canSend && baseStatus === "refundable",
        },
    });
    const execute = useWriteIApplicationIssueRefund();
    const wait = useWaitForTransactionReceipt({ hash: execute.data });

    // A wallet rejection is not an error state: back to the button.
    const executeReset = execute.reset;
    useEffect(() => {
        if (isUserRejection(execute.error)) executeReset();
    }, [execute.error, executeReset]);

    // Someone else refunded between page load and the simulation.
    const simulationRevert = getRevertErrorName(prepare.error);
    const alreadyIssued = simulationRevert === "RefundAlreadyIssued";
    const refetchStatus = refund.refetch;
    useEffect(() => {
        if (alreadyIssued) refetchStatus();
    }, [alreadyIssued, refetchStatus]);

    const notified = useRef(false);
    useEffect(() => {
        if (wait.isSuccess && !notified.current) {
            notified.current = true;
            refetchStatus();
            onRefunded?.();
        }
    }, [wait.isSuccess, refetchStatus, onRefunded]);

    if (isNil(deposit) || isNil(asset) || !enabled) return null;

    const failure = execute.error ?? wait.error ?? prepare.error;
    const status: RefundStatus =
        refund.refundIssued || wait.isSuccess || alreadyIssued
            ? "refunded"
            : execute.isPending || wait.isLoading
              ? "refunding"
              : isNotNil(failure)
                ? "failed"
                : baseStatus;

    return (
        <RefundDepositView
            status={status}
            asset={asset}
            transactionHash={execute.data}
            errorMessage={
                status === "failed"
                    ? refundErrorMessage({
                          revertName: getRevertErrorName(failure),
                          reason: getRevertReason(failure),
                      })
                    : undefined
            }
            onRefund={() => {
                if (status === "unavailable") return void refetchStatus();
                sender.send(() => {
                    if (prepare.data)
                        execute.writeContract(prepare.data.request);
                });
            }}
        />
    );
};
