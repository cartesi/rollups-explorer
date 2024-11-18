import {
    useReadV2CartesiApplicationWasOutputExecuted,
    useSimulateV2CartesiApplicationExecuteOutput,
    useWriteV2CartesiApplicationExecuteOutput,
} from "@cartesi/rollups-wagmi";
import { Button, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { isNotNil, isNotNilOrEmpty } from "ramda-adjunct";
import { FC, useEffect, useMemo } from "react";
import { Address, Hex } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { InputItemFragment } from "../../graphql/explorer/operations";
import { Voucher } from "../../graphql/rollups/v2/types";

interface Props {
    input: InputItemFragment;
    voucher: Pick<Voucher, "index" | "payload" | "proof">;
}

const VoucherExecutionV2: FC<Props> = ({ input, voucher }) => {
    const { isConnected } = useAccount();
    const appAddress = input.application.address as Address;
    const payload = voucher.payload as Hex;
    const proof = {
        outputIndex: BigInt(voucher.proof?.outputIndex ?? 0),
        outputHashesSiblings: (voucher.proof?.outputHashesSiblings ??
            []) as Hex[],
    };

    const {
        data: wasOutputExecuted,
        isFetching: checkingOutputExecution,
        error: checkingOutputExecutionError,
        refetch: recheckOutputExecution,
    } = useReadV2CartesiApplicationWasOutputExecuted({
        args: [BigInt(voucher.index!)],
        address: appAddress,
        query: {
            enabled: isNotNil(voucher.index),
        },
    });

    const notExecuted = !checkingOutputExecution && wasOutputExecuted === false;

    const prepare = useSimulateV2CartesiApplicationExecuteOutput({
        args: [payload, proof],
        address: appAddress,
        query: {
            enabled: notExecuted && isConnected,
        },
    });

    const execute = useWriteV2CartesiApplicationExecuteOutput();
    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });

    const errors = useMemo(() => {
        return [checkingOutputExecutionError, prepare.error].filter(
            isNotNilOrEmpty,
        );
    }, [checkingOutputExecutionError, prepare.error]);

    const hasErrors = errors.length > 0;
    const isTooltipEnabled = (!isConnected && notExecuted) || hasErrors;
    const tooltipText = hasErrors
        ? "There is a problem with this voucher. Check the notification."
        : !isConnected
        ? "Connect your wallet to execute the voucher"
        : "";

    const executing = execute.isPending || wait.isFetching;

    const isExecuteDisabled =
        !isConnected ||
        checkingOutputExecution ||
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
            recheckOutputExecution();
        }
    }, [wait.isSuccess, recheckOutputExecution, execute]);

    useEffect(() => {
        if (errors.length > 0) {
            errors.forEach((error: any) => {
                console.log(error);
                notifications.show({
                    title: "Voucher execution status",
                    message: error.shortMessage ?? error.message,
                    color: "red",
                    withBorder: true,
                    withCloseButton: true,
                    autoClose: false,
                    styles: {
                        body: {
                            maxHeight: 200,
                            overflowY: "scroll",
                        },
                    },
                });
            });
        }
    }, [errors]);

    return (
        <div>
            <Tooltip label={tooltipText} disabled={!isTooltipEnabled}>
                <Button
                    disabled={isExecuteDisabled}
                    loading={executing}
                    onClick={() => execute.writeContract(prepare.data!.request)}
                >
                    {wasOutputExecuted
                        ? "Executed"
                        : checkingOutputExecution
                        ? "Checking voucher..."
                        : prepare.isFetching
                        ? "Preparing voucher..."
                        : "Execute"}
                </Button>
            </Tooltip>
        </div>
    );
};

export default VoucherExecutionV2;
