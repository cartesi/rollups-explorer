declare namespace NodeJS {
    export interface ProcessEnv {
        /**
         * When enabled display a few header actions to help generate mock data
         * from react-query current query cache information.
         */
        NEXT_PUBLIC_DEBUG_ENABLED: string;
        DEBUG_ENABLED: string;

        /**
         * When enabled will inject query data directly into the
         * react query cache information. Also, sets the client
         * to never gc the cache or mark this data as stale (so it will never go to the network)
         * The mock is usually a recording of a node-api real responses.
         */
        NEXT_PUBLIC_MOCK_ENABLED: string;

        MOCK_ENABLED: string;

        /**
         * Cartesi rollups node RPC endpoint.
         */
        NEXT_PUBLIC_CARTESI_NODE_RPC_URL: string;

        /**
         * Meant to add configuration flexibility (e.g. containers with different configurations).
         * When empty the NEXT_PUBLIC prefixed version should be the fallback.
         * Cartesi rollups node RPC endpoint.
         */
        CARTESI_NODE_RPC_URL: string;

        /**
         * Meant to add configuration flexibility (e.g. containers with different configurations).
         * When empty the NEXT_PUBLIC version should be the fallback.
         * The node RPC provider to communicate (i.e. send transactions). (e.g. provider alchemy / infura / anvil)
         */
        NODE_RPC_URL?: string;

        /**
         * The node RPC provider to communicate (i.e. send transactions). (e.g. provider alchemy / infura / anvil)
         */
        NEXT_PUBLIC_NODE_RPC_URL: string;

        /**
         * Signal the app is in an containerize environment.
         */
        NEXT_PUBLIC_IS_CONTAINER?: string;

        /**
         * required id to use with walletconnect. Check {@link: https://cloud.walletconnect.com/}
         */
        NEXT_PUBLIC_PROJECT_ID: string;
    }
}
