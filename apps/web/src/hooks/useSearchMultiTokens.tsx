import { Address } from "viem";
import { useMultiTokensQuery } from "../graphql/explorer/hooks/queries";

type SearchInput = { address?: string; limit?: number };
type SearchOutput = { fetching: boolean; multiTokens: Address[] };
type UseSearchMultiTokens = (args: SearchInput) => SearchOutput;

export const useSearchMultiTokens: UseSearchMultiTokens = ({
    address,
    limit,
}) => {
    const [{ data, fetching }] = useMultiTokensQuery({
        variables: {
            limit: limit ?? 10,
            where: {
                id_containsInsensitive: address ?? "",
            },
        },
    });

    const multiTokens = (data?.multiTokens ?? []).map((t) => t.id as Address);
    return { multiTokens, fetching };
};
