import {
    useSimulateErc721Approve,
    useWriteErc721Approve,
} from "@cartesi/rollups-wagmi";
import { Hex } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";

interface Props {
    erc721Address: Hex;
    args: [operator: Hex, tokenId: bigint];
    isQueryEnabled: boolean;
}

export const useERC721Approve = ({
    erc721Address,
    args,
    isQueryEnabled,
}: Props) => {
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
