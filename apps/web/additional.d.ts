declare namespace NodeJS {
    export interface ProcessEnv {
        /**
         * Network chain id
         */
        NEXT_PUBLIC_CHAIN_ID: string;
        /**
         * Public available rollups-explorer-api graphql endpoint.
         */
        NEXT_PUBLIC_EXPLORER_API_URL: string;
        /**
         * Alchemy API key to have an extra rpc-node to work in conjunction with public nodes.
         */
        NEXT_PUBLIC_ALCHEMY_API_KEY: string;
        /**
         * Optional rollups-explorer-api URL to work with server-side calls.
         * Internal calls may need a different URI to become reachable.
         */
        INTERNAL_EXPLORER_API_URL: string;
    }
}
