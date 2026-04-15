import { afterEach, describe, expect, test, vi } from "vitest";
import { getConfiguredNodeRpcUrl } from "../../src/lib/getConfigNodeRpcUrl";

describe("getConfiguredNodeRpcUrl function", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    test("should return server-side NODE_RPC_URL when set", () => {
        vi.stubEnv("NODE_RPC_URL", "https://private-rpc.local");
        vi.stubEnv("NEXT_PUBLIC_NODE_RPC_URL", "https://public-rpc.local");

        expect(getConfiguredNodeRpcUrl()).toBe("https://private-rpc.local");
    });

    test("should fallback to NEXT_PUBLIC_NODE_RPC_URL", () => {
        vi.stubEnv("NODE_RPC_URL", "");
        vi.stubEnv("NEXT_PUBLIC_NODE_RPC_URL", "https://public-rpc.local");

        expect(getConfiguredNodeRpcUrl()).toBe("https://public-rpc.local");
    });

    test("should return undefined when no env var is set", () => {
        vi.stubEnv("NODE_RPC_URL", undefined as unknown as string);
        vi.stubEnv("NEXT_PUBLIC_NODE_RPC_URL", undefined as unknown as string);

        expect(getConfiguredNodeRpcUrl()).toBeUndefined();
    });
});
