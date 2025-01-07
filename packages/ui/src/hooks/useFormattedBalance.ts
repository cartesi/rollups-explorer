import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { useMemo } from "react";

export const useFormattedBalance = () => {
    const { address } = useAccount();
    const { data } = useBalance({
        address,
    });

    return useMemo(
        () => (data ? formatUnits(data.value, data.decimals) : "0"),
        [data],
    );
};
