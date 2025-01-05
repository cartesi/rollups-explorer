import { erc20Abi } from "@cartesi/rollups-wagmi";
import { isNotNilOrEmpty } from "ramda-adjunct";
import { Hex, getAddress } from "viem";
import { BaseError, useReadContracts } from "wagmi";
import useWatchQueryOnBlockChange from "../../hooks/useWatchQueryOnBlockChange";

interface Props {
    erc20Address: Hex;
    spenderAddress: Hex;
    ownerAddress: Hex;
}

/**
 * The read will only go into the wire when all required
 * addresses are not nil.
 * It will fetch information about the target ERC-20 contract address
 * in conjuction with the owner and spender. So the information returned are
 * balance, decimals, symbol and current allowance.
 *
 * @param props {Props}
 * @returns
 */
export const useERC20Reads = ({
    erc20Address,
    spenderAddress,
    ownerAddress,
}: Props) => {
    const erc20Contract = {
        abi: erc20Abi,
        address: erc20Address,
    };

    const erc20 = useReadContracts({
        query: {
            enabled:
                isNotNilOrEmpty(erc20Address) &&
                isNotNilOrEmpty(spenderAddress) &&
                isNotNilOrEmpty(ownerAddress),
        },
        contracts: [
            { ...erc20Contract, functionName: "decimals" },
            { ...erc20Contract, functionName: "symbol" },
            {
                ...erc20Contract,
                functionName: "allowance",
                args: [getAddress(ownerAddress!), spenderAddress],
            },
            {
                ...erc20Contract,
                functionName: "balanceOf",
                args: [ownerAddress!],
            },
        ],
    });

    useWatchQueryOnBlockChange(erc20.queryKey);

    const { isFetching, isLoading, isSuccess } = erc20;
    const decimals = erc20.data?.[0].result as number | undefined;
    const symbol = erc20.data?.[1].result as string | undefined;
    const allowance = erc20.data?.[2].result as bigint | undefined;
    const balance = erc20.data?.[3].result as bigint | undefined;
    const errors = erc20.data
        ? erc20.data
              .filter((d) => d.error instanceof Error)
              .map((d) => {
                  return (d.error as BaseError).shortMessage;
              })
        : [];

    return {
        symbol,
        allowance,
        balance,
        decimals,
        errors,
        isFetching,
        isLoading,
        isSuccess,
    };
};

export type UseERC20ReadsReturn = ReturnType<typeof useERC20Reads>;
