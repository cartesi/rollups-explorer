import { Client, cacheExchange, createClient, fetchExchange } from "urql/core";

let urqlClient: Client | null = null;
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

export const getUrqlClient = () => {
    if (!urqlClient) {
        const url = process.env.NEXT_PUBLIC_EXPLORER_API_URL ?? "";
        urqlClient = buildClient(url);
    }

    return urqlClient;
};

export const getUrqlServerClient = () => {
    if (!urqlServerClient) {
        const url =
            process.env.INTERNAL_EXPLORER_API_URL ??
            process.env.NEXT_PUBLIC_EXPLORER_API_URL ??
            "";

        urqlServerClient = buildClient(url);
    }

    return urqlServerClient;
};
