import { http, HttpResponse } from "msw";
import { setupWorker } from "msw/browser";
import { createClockState } from "./clock";
import { createEthHandlers } from "./eth";
import { createNodeSource, getScenarioSchedules } from "./node";
import { createCartesiHandlers, handleRpcBody } from "./rpc";
import { MOCK_RPC_PATH, MOCK_WORKER_URL } from "./url";

const SESSION_HEAD = 25_000n;

const clock = createClockState(
    SESSION_HEAD,
    Date.now(),
    getScenarioSchedules(),
);

const source = createNodeSource(() => clock);

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
