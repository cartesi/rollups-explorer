import { Client, cacheExchange, createClient, fetchExchange } from "urql/core";
import { getConfiguredPublicExplorerAPI } from "./getConfigExplorerAPIUrl";
import { getConfiguredInternalExplorerAPI } from "./getConfigExplorerInternalAPIUrl";

let urqlServerClient: Client | null = null;

const buildClient = (url?: string) => {
    if (!url)
        throw new Error(
            "Rollups explorer API URL not defined! Check .env.template file for reference.",
        );

    return createClient({
        url,
        exchanges: [cacheExchange, fetchExchange],
    });
};

export const getUrqlClient = (url: string) => {
    return buildClient(url);
};

export const getUrqlServerClient = () => {
    if (!urqlServerClient) {
        const url =
            getConfiguredInternalExplorerAPI() ??
            getConfiguredPublicExplorerAPI() ??
            "";

        urqlServerClient = buildClient(url);
    }

    return urqlServerClient;
};
