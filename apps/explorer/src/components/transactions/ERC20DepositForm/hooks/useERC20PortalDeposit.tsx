import {
    useSimulateErc20PortalDepositErc20Tokens,
    useWriteErc20PortalDepositErc20Tokens,
} from "@cartesi/wagmi";
import { type Hex } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";

interface Props {
    contractParams: {
        args: [
            erc20Address: Hex,
            appAddress: Hex,
            amount: bigint,
            execLayerData: Hex,
        ];
    };
    isQueryEnabled: boolean;
}

/**
 * Generate wagmi calls based on the parameters passed down.
 * simulate contract call will not run until the query-enabled params is true.
 * @parameters {Props}
 * @returns
 */
export const useERC20PortalDeposit = ({
    contractParams,
    isQueryEnabled,
}: Props) => {
    const prepare = useSimulateErc20PortalDepositErc20Tokens({
        args: contractParams.args,
        query: {
            enabled: isQueryEnabled,
        },
    });

    const execute = useWriteErc20PortalDepositErc20Tokens();

    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });

    return {
        prepare,
        execute,
        wait,
    };
};
