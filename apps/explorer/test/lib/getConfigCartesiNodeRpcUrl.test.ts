import { afterEach, describe, expect, test, vi } from "vitest";
import { getConfiguredCartesiNodeRpcUrl } from "../../src/lib/getConfigCartesiNodeRpcUrl";

describe("getConfiguredCartesiNodeRpcUrl function", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    test("should return server-side CARTESI_NODE_RPC_URL when set", () => {
        vi.stubEnv("CARTESI_NODE_RPC_URL", "http://localhost:10011/rpc");
        vi.stubEnv("NEXT_PUBLIC_CARTESI_NODE_RPC_URL", "http://public/rpc");

        expect(getConfiguredCartesiNodeRpcUrl()).toBe(
            "http://localhost:10011/rpc",
        );
    });

    test("should fallback to NEXT_PUBLIC_CARTESI_NODE_RPC_URL", () => {
        vi.stubEnv("CARTESI_NODE_RPC_URL", "");
        vi.stubEnv("NEXT_PUBLIC_CARTESI_NODE_RPC_URL", "http://public/rpc");

        expect(getConfiguredCartesiNodeRpcUrl()).toBe("http://public/rpc");
    });

    test("should return undefined when no env var is set", () => {
        expect(getConfiguredCartesiNodeRpcUrl()).toBeUndefined();
    });
});
