import { FC } from "react";
import { Client, Provider, cacheExchange, fetchExchange } from "urql";
export type GraphQLProviderProps = {
    children?: React.ReactNode;
};

const url =
    process.env.NEXT_PUBLIC_BE_GRAPHQL_URL ??
    "https://squid.subsquid.io/rollups-sepolia/graphql";

const GraphQLProvider: FC<GraphQLProviderProps> = (props) => {
    // TODO: change according to selected chain
    const client = new Client({
        url,
        exchanges: [cacheExchange, fetchExchange],
    });
    return <Provider value={client}>{props.children}</Provider>;
};

export default GraphQLProvider;
