import {
    useSimulateErc20Approve,
    useWriteErc20Approve,
} from "@cartesi/rollups-wagmi";
import { erc20Abi, Hex } from "viem";
import {
    UseSimulateContractReturnType,
    useWaitForTransactionReceipt,
} from "wagmi";

interface Props {
    erc20Address: Hex;
    args: [spender: Hex, amount: bigint];
    isQueryEnabled: boolean;
}

interface UseERC20ApproveReturn {
    approvePrepare: UseSimulateContractReturnType<typeof erc20Abi, "approve">;
    approve: ReturnType<typeof useWriteErc20Approve>;
    approveWait: ReturnType<typeof useWaitForTransactionReceipt>;
}

export const useERC20Approve = ({
    args,
    erc20Address,
    isQueryEnabled,
}: Props): UseERC20ApproveReturn => {
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
