import {
    useSimulateErc721Approve,
    useWriteErc721Approve,
} from "@cartesi/rollups-wagmi";
import { Hex, erc721Abi } from "viem";
import {
    UseSimulateContractReturnType,
    useWaitForTransactionReceipt,
} from "wagmi";

interface Props {
    erc721Address: Hex;
    args: [operator: Hex, tokenId: bigint];
    isQueryEnabled: boolean;
}

interface UseERC721ApproveReturn {
    approvePrepare: UseSimulateContractReturnType<typeof erc721Abi, "approve">;
    approve: ReturnType<typeof useWriteErc721Approve>;
    approveWait: ReturnType<typeof useWaitForTransactionReceipt>;
}

export const useERC721Approve = ({
    erc721Address,
    args,
    isQueryEnabled,
}: Props): UseERC721ApproveReturn => {
    const approvePrepare = useSimulateErc721Approve({
        address: erc721Address,
        args,
        query: {
            enabled: isQueryEnabled,
        },
    });
    const approve = useWriteErc721Approve();
    const approveWait = useWaitForTransactionReceipt({
        hash: approve.data,
    });

    return {
        approve,
        approvePrepare,
        approveWait,
    };
};
