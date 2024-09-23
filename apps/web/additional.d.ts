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
