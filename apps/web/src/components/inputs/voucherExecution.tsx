"use client";
import { FC, useCallback } from "react";
import { Button, Loader, Tooltip } from "@mantine/core";
import { Address } from "wagmi";
import {
    useCartesiDAppExecuteVoucher,
    useCartesiDAppWasVoucherExecuted,
} from "@cartesi/rollups-wagmi";
import { Voucher } from "../../graphql/rollups/types";

export interface VoucherExecutionType {
    appId: Address;
    vouchers: Partial<Voucher>[];
}

const VoucherExecution: FC<VoucherExecutionType> = (props) => {
    const { appId, vouchers } = props;
    const [voucher] = vouchers;
    const hasVoucher = typeof voucher === "object" && voucher !== null;
    const hasVoucherProof =
        typeof voucher?.proof === "object" && voucher?.proof !== null;

    const wasExecuted = useCartesiDAppWasVoucherExecuted({
        args: [
            BigInt(voucher.input?.index as number),
            BigInt(voucher.index as number),
        ],
        address: appId,
        enabled: hasVoucher,
    });
    const execute = useCartesiDAppExecuteVoucher({
        args: [
            voucher.destination as `0x${string}`,
            voucher.payload as `0x${string}`,
            voucher.proof as any,
        ],
        address: appId,
    });
    const isExecuted = wasExecuted.data || execute.status === "success";

    const onExecute = useCallback(() => {
        execute.write();
    }, [execute]);

    return hasVoucher ? (
        <div>
            {wasExecuted.isLoading ? (
                <Loader />
            ) : (
                <Tooltip
                    label={hasVoucherProof ? "" : "Voucher proof is pending"}
                    disabled={hasVoucherProof}
                >
                    <Button
                        mt={6}
                        disabled={!hasVoucherProof || isExecuted}
                        loading={execute.isLoading}
                        onClick={onExecute}
                    >
                        {isExecuted ? "Executed" : "Execute"}
                    </Button>
                </Tooltip>
            )}
        </div>
    ) : null;
};

export default VoucherExecution;
