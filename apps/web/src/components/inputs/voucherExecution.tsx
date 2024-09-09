"use client";
import {
    useReadCartesiDAppWasVoucherExecuted,
    useSimulateCartesiDAppExecuteVoucher,
    useWriteCartesiDAppExecuteVoucher,
} from "@cartesi/rollups-wagmi";
import { Button, Flex, Loader, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FC, useEffect } from "react";
import type { Address } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { Voucher } from "../../graphql/rollups/types";

const typeCastProof = (voucher: Partial<Voucher>) => ({
    context: voucher.proof?.context as Address,
    validity: {
        inputIndexWithinEpoch: BigInt(
            (voucher.proof?.validity?.inputIndexWithinEpoch as number) ?? 0,
        ),
        outputIndexWithinInput: BigInt(
            (voucher.proof?.validity?.outputIndexWithinInput as number) ?? 0,
        ),
        outputHashesRootHash: voucher.proof?.validity
            ?.outputHashesRootHash as Address,
        vouchersEpochRootHash: voucher.proof?.validity
            ?.vouchersEpochRootHash as Address,
        noticesEpochRootHash: voucher.proof?.validity
            ?.noticesEpochRootHash as Address,
        machineStateHash: voucher.proof?.validity?.machineStateHash as Address,
        outputHashInOutputHashesSiblings: voucher.proof?.validity
            ?.outputHashInOutputHashesSiblings as readonly Address[],
        outputHashesInEpochSiblings: voucher.proof?.validity
            ?.outputHashesInEpochSiblings as readonly Address[],
    },
});

export interface VoucherExecutionType {
    appId: Address;
    voucher: Partial<Voucher>;
}

const VoucherExecution: FC<VoucherExecutionType> = (props) => {
    const { appId, voucher } = props;
    const { isConnected } = useAccount();
    const hasVoucherProof =
        typeof voucher?.proof === "object" && voucher?.proof !== null;

    const wasExecuted = useReadCartesiDAppWasVoucherExecuted({
        args: [
            BigInt(voucher.input?.index as number),
            BigInt(voucher.index as number),
        ],
        address: appId,
    });
    const prepare = useSimulateCartesiDAppExecuteVoucher({
        args: [
            voucher.destination as Address,
            voucher.payload as Address,
            typeCastProof(voucher),
        ],
        address: appId,
    });
    const execute = useWriteCartesiDAppExecuteVoucher();
    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });
    const isLoading = execute.status === "pending" || wait.isLoading;
    const isExecuted = wasExecuted.data || wait.status === "success";
    const isTooltipEnabled =
        (!isConnected && !isExecuted) || (isConnected && !hasVoucherProof);
    const isExecuteDisabled =
        isExecuted ||
        !hasVoucherProof ||
        !isConnected ||
        prepare.isPending ||
        prepare.isError;

    useEffect(() => {
        if (wait.isSuccess) {
            notifications.show({
                message: "Voucher executed successfully",
                color: "green",
                withBorder: true,
            });
        }
    }, [wait.isSuccess]);

    useEffect(() => {
        if (hasVoucherProof && prepare.isError) {
            notifications.show({
                message: `Voucher error: ${prepare.error.message}`,
                color: "red",
                withBorder: true,
                withCloseButton: true,
                autoClose: false,
                styles: {
                    body: {
                        maxHeight: 200,
                        overflowY: "auto",
                    },
                },
            });
        }
    }, [hasVoucherProof, prepare.error, prepare.isError]);

    return (
        <div>
            {wasExecuted.isLoading ? (
                <Flex justify="center" align="center">
                    <Loader data-testid="voucher-execution-loader" size={26} />
                </Flex>
            ) : (
                <Tooltip
                    label={
                        !isConnected && !isExecuted
                            ? "Connect your wallet to execute the voucher"
                            : "Voucher proof is pending"
                    }
                    disabled={!isTooltipEnabled}
                >
                    <Button
                        disabled={isExecuteDisabled}
                        loading={isLoading}
                        onClick={() =>
                            execute.writeContract(prepare.data!.request)
                        }
                    >
                        {prepare.isPending
                            ? "Preparing voucher..."
                            : isExecuted
                            ? "Executed"
                            : "Execute"}
                    </Button>
                </Tooltip>
            )}
        </div>
    );
};

export default VoucherExecution;
