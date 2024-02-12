"use client";
import { FC, useCallback } from "react";
import { Button, Loader } from "@mantine/core";
import { Address } from "wagmi";
import { useCartesiDAppWasVoucherExecuted, useCartesiDAppExecuteVoucher } from "@cartesi/rollups-wagmi";
import { Voucher } from "web/src/graphql/rollups/types";

export interface VoucherExecutionType {
    appId: Address;
    voucher: Partial<Voucher>;
}

const VoucherExecution: FC<VoucherExecutionType> = (props) => {
    const { appId, voucher } = props;
    const wasExecuted = useCartesiDAppWasVoucherExecuted({
        args: [BigInt(voucher.input?.index as number), BigInt(voucher.index as number)],
        address: appId,
    })
    const execute = useCartesiDAppExecuteVoucher({
        args: [voucher.destination as `0x${string}`, voucher.payload as `0x${string}`, voucher.proof as any],
        address: appId
    })
    const hasProof = typeof voucher.proof === 'object' && voucher.proof !== null;
    const isExecuted = wasExecuted.data || execute.status === 'success';

    const onExecute = useCallback(() => {
        execute.write()
    }, [execute]);

    return (
        <div>
            {wasExecuted.isLoading ? (
                <Loader />
            ) : (
                <Button mt={6} disabled={isExecuted} loading={execute.isLoading} onClick={onExecute}>
                    {isExecuted ? 'Executed' : 'Execute'}
                </Button>
            )}
        </div>
    );
};

export default VoucherExecution;
