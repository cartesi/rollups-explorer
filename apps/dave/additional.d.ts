declare namespace NodeJS {
    export interface ProcessEnv {
        /**
         * When enabled display a few header actions to help generate mock data
         * from react-query current query cache information.
         */
        NEXT_PUBLIC_DEBUG_ENABLED: string;

        /**
         * When enabled will inject query data directly into the
         * react query cache information. Also, sets the client
         * to never gc the cache or mark this data as stale (so it will never go to the network)
         * The mock is usually a recording of a node-api real responses.
         */
        NEXT_PUBLIC_MOCK_ENABLED: string;

        /**
         * Cartesi rollups node RPC endpoint.
         */
        NEXT_PUBLIC_CARTESI_NODE_RPC_URL: string;
    }
}
