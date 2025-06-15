import { Address } from "viem";
import { useMultiTokensQuery } from "@cartesi/rollups-explorer-domain/explorer-hooks";

type SearchInput = { address?: string; limit?: number; chainId: string };
type SearchOutput = { fetching: boolean; multiTokens: Address[] };
type UseSearchMultiTokens = (args: SearchInput) => SearchOutput;

export const useSearchMultiTokens: UseSearchMultiTokens = ({
    address,
    limit,
    chainId,
}) => {
    const [{ data, fetching }] = useMultiTokensQuery({
        variables: {
            limit: limit ?? 10,
            where: {
                id_containsInsensitive: address ?? "",
                chain: {
                    id_eq: chainId,
                },
            },
        },
    });

    const multiTokens = (data?.multiTokens ?? []).map(
        (t) => t.address as Address,
    );
    return { multiTokens, fetching };
};
