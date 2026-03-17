import { type Hex } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";
import {
    useSimulateErc721Approve,
    useWriteErc721Approve,
} from "../../../../generated/wagmi";

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
        query: {
            enabled: isQueryEnabled,
        },
        args,
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
