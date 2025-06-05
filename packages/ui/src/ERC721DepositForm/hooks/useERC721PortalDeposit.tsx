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
            erc721Address: Hex,
            appAddress: Hex,
            tokenId: bigint,
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
export const useERC721PortalDeposit = ({
    appVersion,
    contractParams,
    isQueryEnabled,
}: Props) => {
    const baseConfig = useMemo(
        () => RollupContract.getERC721PortalConfig(appVersion ?? "v1"),
        [appVersion],
    );

    const prepare = useSimulateContract({
        abi: baseConfig.abi!,
        address: baseConfig.address!,
        ...contractParams,
        functionName: "depositERC721Token",
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
