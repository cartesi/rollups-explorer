import React from "react";
import { useTokensQuery } from "../graphql/explorer/hooks/queries";

export const useSearchTokens = ({
    address,
    limit,
}: {
    address?: string;
    limit?: number;
}) => {
    const [{ data: tokenData, fetching }] = useTokensQuery({
        variables: {
            limit: limit ?? 10,
            where: {
                id_containsInsensitive: address ?? "",
            },
        },
    });
    const tokens = React.useMemo(
        () =>
            (tokenData?.tokens ?? []).map(
                (a) => `${a.symbol} - ${a.name} - ${a.id}`,
            ),
        [tokenData],
    );
    return { tokens, fetching };
};
