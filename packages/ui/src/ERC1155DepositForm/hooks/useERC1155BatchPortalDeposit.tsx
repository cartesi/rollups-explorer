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
        args: [
            erc1155Address: Hex,
            appAddress: Hex,
            tokenIds: bigint[],
            amounts: bigint[],
            baseLayerData: Hex,
            execLayerData: Hex,
        ];
    };
    appVersion: RollupVersion | undefined;
    isQueryEnabled: boolean;
}

/**
 * Generate wagmi calls based on the parameters passed down.
 * The AppVersion parameter is important, when it is undefined the
 * simulate contract call will not run until it is defined.
 * @parameters {Props}
 * @returns
 */
export const useERC1155BatchPortalDeposit = ({
    appVersion,
    contractParams,
    isQueryEnabled,
}: Props) => {
    const baseConfig = useMemo(
        () => RollupContract.getERC1155BatchPortalConfig(appVersion ?? "v1"),
        [appVersion],
    );

    const enableDeposit = isQueryEnabled && isNotNilOrEmpty(appVersion);

    const depositPrepare = useSimulateContract({
        abi: baseConfig.abi!,
        address: baseConfig.address!,
        ...contractParams,
        functionName: "depositBatchERC1155Token",
        query: {
            enabled: enableDeposit,
        },
    });

    const deposit = useWriteContract();

    const depositWait = useWaitForTransactionReceipt({
        hash: deposit.data,
        query: {
            enabled: enableDeposit,
        },
    });

    return {
        depositPrepare,
        deposit,
        depositWait,
    };
};
