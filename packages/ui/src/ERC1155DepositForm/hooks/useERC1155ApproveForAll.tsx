import {
    useSimulateErc1155SetApprovalForAll,
    useWriteErc1155SetApprovalForAll,
} from "@cartesi/rollups-wagmi";
import { Hex } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";

interface Props {
    erc1155Address: Hex;
    args: [operator: Hex, allowed: boolean];
    isQueryEnabled: boolean;
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
}: Props) => {
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
