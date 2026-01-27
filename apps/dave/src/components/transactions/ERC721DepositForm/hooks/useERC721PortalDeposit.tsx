import {
    useSimulateErc721PortalDepositErc721Token,
    useWriteErc721PortalDepositErc721Token,
} from "@cartesi/wagmi";
import type { Hex } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";

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
    isQueryEnabled: boolean;
}

export const useERC721PortalDeposit = ({
    contractParams,
    isQueryEnabled,
}: Props) => {
    const prepare = useSimulateErc721PortalDepositErc721Token({
        args: contractParams.args,
        query: {
            enabled: isQueryEnabled,
        },
    });

    const execute = useWriteErc721PortalDepositErc721Token();

    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });

    return {
        prepare,
        execute,
        wait,
    };
};
