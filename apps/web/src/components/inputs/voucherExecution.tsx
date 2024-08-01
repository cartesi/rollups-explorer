"use client";
import {
    useReadCartesiDAppWasVoucherExecuted,
    useSimulateCartesiDAppExecuteVoucher,
    useWriteCartesiDAppExecuteVoucher,
} from "@cartesi/rollups-wagmi";
import { Button, Flex, Loader, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { FC, useEffect } from "react";
import { Address } from "viem";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { Voucher } from "../../graphql/rollups/types";

const typeCastProof = (voucher: Partial<Voucher>) => ({
    context: voucher.proof?.context as `0x${string}`,
    validity: {
        inputIndexWithinEpoch: BigInt(
            (voucher.proof?.validity?.inputIndexWithinEpoch as number) ?? 0,
        ),
        outputIndexWithinInput: BigInt(
            (voucher.proof?.validity?.outputIndexWithinInput as number) ?? 0,
        ),
        outputHashesRootHash: voucher.proof?.validity
            ?.outputHashesRootHash as `0x${string}`,
        vouchersEpochRootHash: voucher.proof?.validity
            ?.vouchersEpochRootHash as `0x${string}`,
        noticesEpochRootHash: voucher.proof?.validity
            ?.noticesEpochRootHash as `0x${string}`,
        machineStateHash: voucher.proof?.validity
            ?.machineStateHash as `0x${string}`,
        outputHashInOutputHashesSiblings: voucher.proof?.validity
            ?.outputHashInOutputHashesSiblings as readonly `0x${string}`[],
        outputHashesInEpochSiblings: voucher.proof?.validity
            ?.outputHashesInEpochSiblings as readonly `0x${string}`[],
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
            voucher.destination as `0x${string}`,
            voucher.payload as `0x${string}`,
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
    const isExecuteDisabled = isExecuted || !hasVoucherProof || !isConnected;

    useEffect(() => {
        if (wait.isSuccess) {
            notifications.show({
                message: "Voucher executed successfully",
                color: "green",
                withBorder: true,
            });
        }
    }, [wait.isSuccess]);

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
                        {isExecuted ? "Executed" : "Execute"}
                    </Button>
                </Tooltip>
            )}
        </div>
    );
};

export default VoucherExecution;
