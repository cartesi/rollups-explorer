import { describe, it, vi } from "vitest";
import getConfiguredChainId from "../../src/lib/getConfiguredChain";

describe("getConfiguredChain", () => {
    beforeEach(() => {
        vi.unstubAllEnvs();
    });

    it("should warn log when the environment variable is not set", () => {
        const stub = vi.spyOn(console, "warn");
        const expectedValue = getConfiguredChainId();
        expect(stub).toHaveBeenCalledTimes(1);
        expect(stub).toHaveBeenCalledWith(
            "Neither NEXT_PUBLIC_CHAIN_ID or CHAIN_ID are defined. 31337 will be used instead.",
        );

        expect(expectedValue).toEqual("31337");
    });

    it("should warn log when the environment variable is set but is not supported", () => {
        vi.stubEnv("CHAIN_ID", "56");
        const stub = vi.spyOn(console, "warn");
        const expectedValue = getConfiguredChainId();

        expect(expectedValue).toEqual("31337");

        expect(stub).toHaveBeenCalledTimes(1);
        expect(stub).toHaveBeenCalledWith(
            "The Chain id 56 is not supported. Supported Chains: [1, 10, 8453, 13370, 31337, 42161, 84532, 421614, 11155111, 11155420]. 31337 will be used instead.",
        );
    });

    it("should return the configured public chain id on environment variable", () => {
        vi.stubEnv("NEXT_PUBLIC_CHAIN_ID", "10");
        expect(getConfiguredChainId()).toStrictEqual("10");
    });

    it("should return chain-id 31337 as default when environment variable is not set", () => {
        vi.stubEnv("NEXT_PUBLIC_CHAIN_ID", "");
        expect(getConfiguredChainId()).toStrictEqual("31337");
    });

    it("should return the value from CHAIN_ID over NEXT_PUBLIC_CHAIN_ID when both are defined", () => {
        vi.stubEnv("NEXT_PUBLIC_CHAIN_ID", "10");
        vi.stubEnv("CHAIN_ID", "1");

        expect(getConfiguredChainId()).toStrictEqual("1");
    });
});
