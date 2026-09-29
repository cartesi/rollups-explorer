import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";
import { createCartesiHandlers, handleRpcBody, type NodeSnapshot } from "./rpc";
import { MOCK_RPC_PATH, MOCK_WORKER_URL } from "./url";

const snapshot = (): NodeSnapshot => ({
    chainId: 13370,
    version: "2.0.0-alpha.12",
    applications: [],
});

const handlers = createCartesiHandlers(snapshot);

const worker = setupWorker(
    http.post(MOCK_RPC_PATH, async ({ request }) =>
        HttpResponse.json(handleRpcBody(handlers, await request.json())),
    ),
);

let started: Promise<unknown> | undefined;

/**
 * Register the service worker that answers the mock node requests. Other
 * requests go to the network.
 */
export const startMockNode = () => {
    started ??= worker.start({
        serviceWorker: { url: MOCK_WORKER_URL },
        onUnhandledRequest: "bypass",
        quiet: true,
    });
    return started;
};
