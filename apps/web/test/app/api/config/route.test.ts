import * as NextServer from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "../../../../src/app/api/config/route";

vi.mock("next/server", async (importOriginal) => {
    const original = await importOriginal<typeof NextServer>();

    const NextResponse = vi.fn();
    // @ts-expect-error
    NextResponse.json = vi.fn();

    return {
        ...original,
        NextResponse,
    };
});

const PUBLIC_CHAIN_ID_VAR_NAME = "NEXT_PUBLIC_CHAIN_ID";
const DYNAMIC_CHAIN_ID_VAR_NAME = "CHAIN_ID";
const IS_CONTAINER_VAR_NAME = "NEXT_PUBLIC_IS_CONTAINER";
const PUBLIC_NODE_RPC_VAR_NAME = "NEXT_PUBLIC_NODE_RPC_URL";
const DYNAMIC_NODE_RPC_VAR_NAME = "NODE_RPC_URL";
const PUBLIC_EXPLORER_API_VAR_NAME = "NEXT_PUBLIC_EXPLORER_API_URL";
const DYNAMIC_EXPLORER_API_VAR_NAME = "EXPLORER_API_URL";

const NextResponseMock = vi.mocked(NextServer.NextResponse);

describe("Config route", () => {
    beforeEach(() => {
        // usual default values
        vi.stubEnv(PUBLIC_CHAIN_ID_VAR_NAME, "31337");
        vi.stubEnv(PUBLIC_EXPLORER_API_VAR_NAME, "http://build-time.io/api");
        vi.stubEnv(
            PUBLIC_NODE_RPC_VAR_NAME,
            "http://build-time.io/v2/rpc-json",
        );
    });

    afterEach(() => {
        vi.unstubAllEnvs();
        vi.clearAllMocks();
    });

    it("should return a 404 when is-container env var is false", async () => {
        vi.stubEnv(IS_CONTAINER_VAR_NAME, "false");
        await GET();
        expect(NextResponseMock).toHaveBeenCalledOnce();
        expect(NextResponseMock).toHaveBeenCalledWith(null, {
            status: 404,
            statusText: "Not Found",
        });
    });

    it("should return a 404 when is-container env var is not defined", async () => {
        await GET();
        expect(NextResponseMock).toHaveBeenCalledOnce();
        expect(NextResponseMock).toHaveBeenCalledWith(null, {
            status: 404,
            statusText: "Not Found",
        });
    });

    it("should respond with default values when is-container env var is true but no overrides are set", async () => {
        vi.stubEnv(IS_CONTAINER_VAR_NAME, "true");
        await GET();

        expect(NextResponseMock.json).toHaveBeenCalledOnce();
        expect(NextResponseMock.json).toHaveBeenCalledWith({
            apiEndpoint: "http://build-time.io/api",
            nodeRpcUrl: "http://build-time.io/v2/rpc-json",
            chainId: "31337",
        });
    });

    it("should respond with new runtime values set when is-container env var is true", async () => {
        vi.stubEnv(IS_CONTAINER_VAR_NAME, "true");
        vi.stubEnv(
            DYNAMIC_EXPLORER_API_VAR_NAME,
            "http://runtime-value.io:9090/new-api/graphql",
        );
        vi.stubEnv(
            DYNAMIC_NODE_RPC_VAR_NAME,
            "http://runtime-value.io:9090/v3/anvil",
        );
        vi.stubEnv(DYNAMIC_CHAIN_ID_VAR_NAME, "11155111");

        await GET();

        expect(NextResponseMock.json).toHaveBeenCalledOnce();
        expect(NextResponseMock.json).toHaveBeenCalledWith({
            apiEndpoint: "http://runtime-value.io:9090/new-api/graphql",
            nodeRpcUrl: "http://runtime-value.io:9090/v3/anvil",
            chainId: "11155111",
        });
    });
});
