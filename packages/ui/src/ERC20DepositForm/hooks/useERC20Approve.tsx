import {
    useSimulateErc20Approve,
    useWriteErc20Approve,
} from "@cartesi/rollups-wagmi";
import { Hex } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";

interface Props {
    erc20Address: Hex;
    args: [spender: Hex, amount: bigint];
    isQueryEnabled: boolean;
}

export const useERC20Approve = ({
    args,
    erc20Address,
    isQueryEnabled,
}: Props) => {
    const approvePrepare = useSimulateErc20Approve({
        address: erc20Address,
        args,
        query: {
            enabled: isQueryEnabled,
        },
    });

    const approve = useWriteErc20Approve();
    const approveWait = useWaitForTransactionReceipt({
        hash: approve.data,
    });

    return {
        approvePrepare,
        approve,
        approveWait,
    };
};
