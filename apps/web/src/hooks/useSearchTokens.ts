import React from "react";
import { useTokensQuery } from "../graphql/explorer/hooks/queries";

export const useSearchTokens = ({
    address,
    limit,
    chainId,
}: {
    address?: string;
    limit?: number;
    chainId: string;
}) => {
    const [{ data: tokenData, fetching }] = useTokensQuery({
        variables: {
            limit: limit ?? 10,
            where: {
                address_containsInsensitive: address ?? "",
                chain: {
                    id_eq: chainId,
                },
            },
        },
    });
    const tokens = React.useMemo(
        () =>
            (tokenData?.tokens ?? []).map(
                (a) => `${a.symbol} - ${a.name} - ${a.address}`,
            ),
        [tokenData],
    );
    return { tokens, fetching };
};
