import { Client, cacheExchange, createClient, fetchExchange } from "urql/core";

let urqlClient: Client | null = null;

export const getUrqlClient = () => {
    if (!urqlClient) {
        urqlClient = createClient({
            url: process.env.NEXT_PUBLIC_EXPLORER_API_URL ?? "",
            exchanges: [cacheExchange, fetchExchange],
        });
    }

    return urqlClient;
};
