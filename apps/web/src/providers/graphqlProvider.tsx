import { isEmpty, not } from "ramda";
import { FC } from "react";
import { Client, Provider, cacheExchange, fetchExchange } from "urql";
export type GraphQLProviderProps = {
    children?: React.ReactNode;
};

const GRAPHQL_URL = process.env.NEXT_PUBLIC_BE_GRAPHQL_URL ?? "";

const url = not(isEmpty(GRAPHQL_URL))
    ? GRAPHQL_URL
    : "https://squid.subsquid.io/rollups-sepolia/v/v5/graphql";

const GraphQLProvider: FC<GraphQLProviderProps> = (props) => {
    // TODO: change according to selected chain
    const client = new Client({
        url,
        exchanges: [cacheExchange, fetchExchange],
    });
    return <Provider value={client}>{props.children}</Provider>;
};

export default GraphQLProvider;
