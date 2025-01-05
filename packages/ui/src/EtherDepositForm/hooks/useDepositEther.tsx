import { useMemo } from "react";
import { Hex } from "viem";
import {
    useSimulateContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";
import RollupContract from "../../commons/RollupContract";
import { RollupVersion } from "../../commons/interfaces";

interface UseEtherDepositProps {
    contractParams: {
        args: [appAddress: Hex, execLayerData: Hex];
        value: bigint | undefined;
    };
    appVersion: RollupVersion;
    isQueryEnabled: boolean;
}

export const useEtherDeposit = ({
    appVersion,
    contractParams,
    isQueryEnabled,
}: UseEtherDepositProps) => {
    const { abi, address } = useMemo(
        () => RollupContract.getEtherPortalConfig(appVersion),
        [appVersion],
    );

    const prepare = useSimulateContract({
        abi: abi!,
        address: address!,
        ...contractParams,
        functionName: "depositEther",
        query: {
            enabled: isQueryEnabled,
        },
    });

    const execute = useWriteContract();

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
