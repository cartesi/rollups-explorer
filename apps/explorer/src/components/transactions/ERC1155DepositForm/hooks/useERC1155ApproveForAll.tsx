"use client";
import { type Hex, erc1155Abi } from "viem";
import {
    type UseSimulateContractReturnType,
    useWaitForTransactionReceipt,
} from "wagmi";
import {
    useSimulateErc1155SetApprovalForAll,
    useWriteErc1155SetApprovalForAll,
} from "../../../../generated/wagmi";

interface Props {
    erc1155Address: Hex;
    args: [operator: Hex, allowed: boolean];
    isQueryEnabled: boolean;
}

interface UseERC1155ApproveForAllReturn {
    approvePrepare: UseSimulateContractReturnType<
        typeof erc1155Abi,
        "setApprovalForAll"
    >;
    approve: ReturnType<typeof useWriteErc1155SetApprovalForAll>;
    approveWait: ReturnType<typeof useWaitForTransactionReceipt>;
}

/*
 * Generate wagmi calls based on the parameters passed down.
 * @parameters {Props}
 * @returns
 */
export const useERC1155ApproveForAll = ({
    erc1155Address,
    args,
    isQueryEnabled,
}: Props): UseERC1155ApproveForAllReturn => {
    const approvePrepare = useSimulateErc1155SetApprovalForAll({
        address: erc1155Address,
        args: args,
        query: {
            enabled: isQueryEnabled,
        },
    });

    const approve = useWriteErc1155SetApprovalForAll();
    const approveWait = useWaitForTransactionReceipt({
        hash: approve.data,
    });

    return {
        approvePrepare,
        approve,
        approveWait,
    };
};
