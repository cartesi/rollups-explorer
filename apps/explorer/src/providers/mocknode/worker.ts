import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";
import { createEthHandlers } from "./eth";
import { createNodeSource, getScenarioSchedules } from "./node";
import { createCartesiHandlers, handleRpcBody } from "./rpc";
import { clockAtom, initMockNodeStore, mockNodeStore } from "./store";
import { MOCK_RPC_PATH, MOCK_WORKER_URL } from "./url";

initMockNodeStore(getScenarioSchedules(), Date.now());

const source = createNodeSource(() => {
    const clock = mockNodeStore.get(clockAtom);
    if (!clock) throw new Error("The mock node clock is not set");
    return clock;
});

const handlers = {
    ...createCartesiHandlers(source.node),
    ...createEthHandlers(source.chain),
};

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
