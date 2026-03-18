import type {
    AbiParametersToPrimitiveTypes,
    ExtractAbiFunction,
} from "abitype";
import { erc20Abi, type Hex, type SimulateContractReturnType } from "viem";
import { useWaitForTransactionReceipt, type Config } from "wagmi";
import {
    useSimulateErc20Approve,
    useWriteErc20Approve,
} from "../../../../generated/wagmi";

interface Props {
    erc20Address: Hex;
    args: [spender: Hex, amount: bigint];
    isQueryEnabled: boolean;
}

type ApproveFunctionName = "approve";
type ApproveArgs = AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<typeof erc20Abi, ApproveFunctionName>["inputs"]
>;

type ApproveSimulateReturn = SimulateContractReturnType<
    typeof erc20Abi,
    ApproveFunctionName
>;

/**
 * Facilitates TypeScript type inference for values returned by useERC20Approve hook.
 */
type ApprovePrepare = ReturnType<
    typeof useSimulateErc20Approve<
        ApproveFunctionName,
        ApproveArgs,
        Config,
        undefined,
        ApproveSimulateReturn
    >
>;
interface UseERC20ApproveReturn {
    approvePrepare: ApprovePrepare;
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
