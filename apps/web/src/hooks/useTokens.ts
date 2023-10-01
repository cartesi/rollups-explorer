import gql from "graphql-tag";
import * as Urql from "urql";
import { QueryTokensArgs, Omit, Token } from "../graphql";

const Tokens = gql`
    query tokens($where: TokenWhereInput) {
        tokens(where: $where) {
            id
            name
            symbol
        }
    }
`;

interface Tokens {
    tokens: Token[];
}

const useTokens = (
    options?: Omit<Urql.UseQueryArgs<QueryTokensArgs>, "query">,
) => {
    return Urql.useQuery<Tokens, QueryTokensArgs>({
        query: Tokens,
        ...options,
    });
};

export default useTokens;
