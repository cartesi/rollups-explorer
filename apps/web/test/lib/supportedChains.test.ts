import { describe, it } from "vitest";
import getSupportedChainInfo, {
    supportedChains,
} from "../../src/lib/supportedChains";

describe("SupportedChains functionalities", () => {
    it("should list all the supported chain ids", () => {
        expect(Object.keys(supportedChains)).toStrictEqual([
            "1",
            "10",
            "8453",
            "13370",
            "31337",
            "42161",
            "84532",
            "421614",
            "11155111",
            "11155420",
        ]);
    });

    it("should return information about a supported chain", () => {
        const chain = getSupportedChainInfo(1);

        expect(chain.id).toStrictEqual(1);
        expect(chain.rpcUrls.default.http[0]).toStrictEqual(
            "https://eth.merkle.io",
        );
    });

    it("should return undefined when asking for a chain id not supported", () => {
        // @ts-ignore
        expect(getSupportedChainInfo(100)).toBeUndefined();
    });
});
