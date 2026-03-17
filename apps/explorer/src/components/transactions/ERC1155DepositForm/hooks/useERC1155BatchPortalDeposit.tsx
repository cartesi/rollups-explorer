"use client";
import {
    useSimulateErc1155BatchPortalDepositBatchErc1155Token,
    useWriteErc1155BatchPortalDepositBatchErc1155Token,
} from "@cartesi/wagmi";
import type { Hex } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";

interface Props {
    contractParams: {
        args: [
            erc1155Address: Hex,
            appAddress: Hex,
            tokenIds: bigint[],
            amounts: bigint[],
            baseLayerData: Hex,
            execLayerData: Hex,
        ];
    };
    isQueryEnabled: boolean;
}

/**
 * Generate wagmi calls based on the parameters passed down.
 * simulate contract call will not run until it is defined.
 * @parameters {Props}
 * @returns
 */
export const useERC1155BatchPortalDeposit = ({
    contractParams,
    isQueryEnabled,
}: Props) => {
    const depositPrepare =
        useSimulateErc1155BatchPortalDepositBatchErc1155Token({
            args: contractParams.args,
            query: {
                enabled: isQueryEnabled,
            },
        });

    const deposit = useWriteErc1155BatchPortalDepositBatchErc1155Token();

    const depositWait = useWaitForTransactionReceipt({
        hash: deposit.data,
        query: {
            enabled: isQueryEnabled,
        },
    });

    return {
        depositPrepare,
        deposit,
        depositWait,
    };
};
