import { isNotNil, propOr } from "ramda";
import { useMemo } from "react";
import { formatUnits } from "viem";
import { useAccount, useBalance } from "wagmi";

type DataType =
    | {
          decimals: number;
          formatted: string;
          symbol: string;
          value: bigint;
      }
    | undefined;

export type UseAccountBalanceResult = {
    value: bigint;
    decimals: number;
    symbol: string;
    formatted: string;
    refetch: ReturnType<typeof useBalance>["refetch"];
};

/**
 * Check the ETH balance of the connected account.
 * returns the value, decimals, symbol, formatted value and fn to refresh the information.
 * @returns
 */
export const useAccountBalance = (): UseAccountBalanceResult => {
    const { address } = useAccount();
    const { data, refetch } = useBalance({
        address,
    });

    const result = useMemo(() => {
        const value = propOr<bigint, DataType, bigint>(0n, "value", data);
        const decimals = propOr<number, DataType, number>(18, "decimals", data);
        const symbol = propOr<string, DataType, string>("ETH", "symbol", data);
        const formatted = isNotNil(data) ? formatUnits(value, decimals) : "0";

        return {
            value,
            decimals,
            symbol,
            formatted,
            refetch,
        };
    }, [data, refetch]);

    return result;
};
