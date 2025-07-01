declare namespace NodeJS {
    export interface ProcessEnv {
        /**
         * Network chain id
         */
        NEXT_PUBLIC_CHAIN_ID: string;
        /**
         * Meant to add configuration flexibility (e.g. containers with different configurations).
         * When empty the NEXT_PUBLIC version should be the fallback.
         * Public available rollups-explorer-api graphql endpoint.
         */
        EXPLORER_API_URL?: string;

        /**
         * The value is interpolated and replace in build time by the value set.
         * Public available rollups-explorer-api graphql endpoint.
         */
        NEXT_PUBLIC_EXPLORER_API_URL: string;

        /**
         * Meant to add configuration flexibility (e.g. containers with different configurations).
         * When empty the NEXT_PUBLIC version should be the fallback.
         * The node RPC provider to communicate (i.e. send transactions). (e.g. provider alchemy / infura)
         */
        NODE_RPC_URL?: string;

        /**
         * The node RPC provider to communicate (i.e. send transactions). (e.g. provider alchemy / infura)
         */
        NEXT_PUBLIC_NODE_RPC_URL: string;

        /**
         * Optional rollups-explorer-api URL to work with server-side calls.
         * Internal calls may need a different URI to become reachable.
         */
        INTERNAL_EXPLORER_API_URL?: string;

        /**
         * Signal the app is in an containerize environment.
         */
        NEXT_PUBLIC_IS_CONTAINER?: string;

        /**
         * CI=true is common set in most CI providers. e.g. Github, TravisCI
         */
        CI?: "true";

        /**
         * Base url to be used inside the e2e tests when calling e.g. page.goto("/applications")
         * Default used in its absence is http://localhost:3000
         */
        E2E_BASE_URL?: string;

        /**
         * The Protection Bypass secret for Automation feature lets you bypass Vercel Deployment Protection
         * for automated tooling (e.g. E2E testing).
         */
        VERCEL_AUTOMATION_BYPASS_SECRET?: string;
    }
}

declare module "@synthetixio/synpress/commands/metamask";

declare module "@synthetixio/synpress/helpers";
