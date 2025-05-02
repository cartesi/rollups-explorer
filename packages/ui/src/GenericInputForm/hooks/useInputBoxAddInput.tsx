import { isNotNilOrEmpty } from "ramda-adjunct";
import { useMemo } from "react";
import { Hex } from "viem";
import {
    useSimulateContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from "wagmi";
import RollupContract from "../../commons/RollupContract";
import { RollupVersion } from "../../commons/interfaces";

interface Props {
    contractParams: {
        args: [appAddress: Hex, payload: Hex];
    };
    appVersion: RollupVersion | undefined;
    isQueryEnabled: boolean;
}

/**
 * Generate wagmi calls based on the parameters passed down.
 * The AppVersion parameter is important, when it is undefined the
 * simulate contract call will not run until it is defined.
 * @param {Props} props
 * @returns
 */
export const useInputBoxAddInput = ({
    appVersion,
    contractParams,
    isQueryEnabled,
}: Props) => {
    const baseConfig = useMemo(
        () => RollupContract.getInputBoxConfig(appVersion ?? "v1"),
        [appVersion],
    );

    const prepare = useSimulateContract({
        abi: baseConfig.abi!,
        address: baseConfig.address!,
        ...contractParams,
        functionName: "addInput",
        query: {
            enabled: isQueryEnabled && isNotNilOrEmpty(appVersion),
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
