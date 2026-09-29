const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");

export const MOCK_RPC_PATH = `${basePath}/mock-rpc`;

export const MOCK_WORKER_URL = `${basePath}/mockServiceWorker.js`;

/**
 * Absolute URL of the mock node, served by the service worker on the same
 * origin as the explorer.
 */
export const getMockRpcUrl = () =>
    typeof window === "undefined"
        ? MOCK_RPC_PATH
        : new URL(MOCK_RPC_PATH, window.location.origin).href;
