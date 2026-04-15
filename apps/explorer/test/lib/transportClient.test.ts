import { createClient, http } from "viem";
import { mainnet } from "viem/chains";
import { afterEach, describe, expect, test, vi } from "vitest";
import createClientFor from "../../src/lib/transportClient";

vi.mock("viem", async () => {
    const actual = await vi.importActual<typeof import("viem")>("viem");
    return {
        ...actual,
        createClient: vi.fn(),
        http: vi.fn(),
    };
});

const createClientMock = vi.mocked(createClient, { partial: true });
const httpMock = vi.mocked(http, { partial: true });

describe("transportClient function", () => {
    afterEach(() => {
        createClientMock.mockReset();
        httpMock.mockReset();
    });

    test("should use the provided nodeRpcUrl when available", () => {
        const transport = { transportType: "custom" };
        const client = { type: "viem" };
        const transportOpts = { timeout: 1000 };
        const customRpcUrl = "https://custom-rpc.example";

        httpMock.mockReturnValue(transport);
        createClientMock.mockReturnValue(client);

        const result = createClientFor(mainnet, customRpcUrl, transportOpts);

        expect(httpMock).toHaveBeenCalledWith(customRpcUrl, transportOpts);
        expect(createClientMock).toHaveBeenCalledWith({
            chain: mainnet,
            transport,
        });
        expect(result).toBe(client);
    });

    test("should fallback to the chain default rpc url", () => {
        const [defaultRpcUrl] = mainnet.rpcUrls.default.http;
        const transport = { transportType: "default" };

        httpMock.mockReturnValue(transport);
        createClientMock.mockReturnValue({ type: "viem" });

        createClientFor(mainnet);

        expect(httpMock).toHaveBeenCalledWith(defaultRpcUrl, undefined);
    });
});
