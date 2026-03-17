import {
    useSimulateInputBoxAddInput,
    useWriteInputBoxAddInput,
} from "@cartesi/wagmi";
import type { Hex } from "viem";
import { useWaitForTransactionReceipt } from "wagmi";

interface Props {
    contractParams: {
        args: [appAddress: Hex, payload: Hex];
    };
    isQueryEnabled: boolean;
}

/**
 * Generate wagmi calls based on the parameters passed down.
 * simulate contract call will not run until the query-enabled params is true
 * @param {Props} props
 * @returns
 */
export const useInputBoxAddInput = ({
    contractParams,
    isQueryEnabled,
}: Props) => {
    const prepare = useSimulateInputBoxAddInput({
        args: contractParams.args,
        query: {
            enabled: isQueryEnabled,
        },
    });

    const execute = useWriteInputBoxAddInput();

    const wait = useWaitForTransactionReceipt({
        hash: execute.data,
    });

    return {
        prepare,
        execute,
        wait,
    };
};
