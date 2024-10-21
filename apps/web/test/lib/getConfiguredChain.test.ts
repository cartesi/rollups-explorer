import { describe, it, vi } from "vitest";
import getConfiguredChainId from "../../src/lib/getConfiguredChain";

describe("getConfiguredChain", () => {
    beforeEach(() => {
        vi.unstubAllEnvs();
    });

    it("should return the configured public chain id on environment variable", () => {
        vi.stubEnv("NEXT_PUBLIC_CHAIN_ID", "10");
        expect(getConfiguredChainId()).toStrictEqual("10");
    });

    it("should return chain-id 31337 as default when environment variable is not set", () => {
        vi.stubEnv("NEXT_PUBLI_CHAIN_ID", "");
        expect(getConfiguredChainId()).toStrictEqual("31337");
    });
});
