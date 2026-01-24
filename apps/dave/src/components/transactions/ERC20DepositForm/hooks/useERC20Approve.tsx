import { erc20Abi, type Hex } from "viem";
import {
    useSimulateContract,
    type UseSimulateContractReturnType,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";

interface Props {
    erc20Address: Hex;
    args: [spender: Hex, amount: bigint];
    isQueryEnabled: boolean;
}

interface UseERC20ApproveReturn {
    approvePrepare: UseSimulateContractReturnType<typeof erc20Abi, "approve">;
    approve: ReturnType<typeof useWriteContract>;
    approveWait: ReturnType<typeof useWaitForTransactionReceipt>;
}

export const useERC20Approve = ({
    args,
    erc20Address,
    isQueryEnabled,
}: Props): UseERC20ApproveReturn => {
    const approvePrepare = useSimulateContract({
        abi: erc20Abi,
        functionName: "approve",
        address: erc20Address,
        args,
        query: {
            enabled: isQueryEnabled,
        },
    });

    const approve = useWriteContract();
    const approveWait = useWaitForTransactionReceipt({
        hash: approve.data,
    });

    return {
        approvePrepare,
        approve,
        approveWait,
    };
};
