"use client";
import {
    useSimulateEtherPortalDepositEther,
    useWriteEtherPortalDepositEther,
} from "@cartesi/wagmi";
import { type Hex } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";

interface UseEtherDepositProps {
    contractParams: {
        args: [appAddress: Hex, execLayerData: Hex];
        value: bigint | undefined;
    };
    isQueryEnabled: boolean;
}

export const useEtherDeposit = ({
    contractParams,
    isQueryEnabled,
}: UseEtherDepositProps) => {
    const prepare = useSimulateEtherPortalDepositEther({
        args: contractParams.args,
        value: contractParams.value,
        query: {
            enabled: isQueryEnabled,
        },
    });

    const execute = useWriteEtherPortalDepositEther();

    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });

    return {
        prepare,
        execute,
        wait,
    };
};

export default useEtherDeposit;
