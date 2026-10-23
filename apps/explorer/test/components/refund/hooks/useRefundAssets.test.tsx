import { renderHook } from "@testing-library/react";
import { parseUnits } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useReadContracts } from "wagmi";
import {
    useRefundAsset,
    useRefundAssets,
} from "../../../../src/components/refund/hooks/useRefundAssets";
import type { RefundAsset } from "../../../../src/components/refund/lib/refundUtils";
import { depositor, token } from "../../../../src/stories/deposits";

vi.mock("wagmi", () => ({
    useReadContracts: vi.fn(),
}));

const mockReadContracts = vi.mocked(useReadContracts);
const otherToken = "0x0761b8e3aB06F458632974393C48765E6Ddc61bB";

const reads = (data: unknown) => {
    mockReadContracts.mockReturnValue({
        data,
        isLoading: false,
        error: null,
    } as never);
};

const ether: RefundAsset = {
    kind: "ether",
    depositor,
    value: parseUnits("1.5", 18),
};
const erc20: RefundAsset = {
    kind: "erc20",
    depositor,
    token,
    value: parseUnits("1.5", 6),
};
const erc721: RefundAsset = {
    kind: "erc721",
    depositor,
    token: otherToken,
    tokenId: 7n,
};

describe("useRefundAssets", () => {
    beforeEach(() => {
        mockReadContracts.mockReset();
        reads(undefined);
    });

    it("should not read anything for Ether only", () => {
        const { result } = renderHook(() => useRefundAssets([ether]));

        expect(result.current).toEqual([ether]);
        expect(mockReadContracts).toHaveBeenCalledWith(
            expect.objectContaining({
                contracts: [],
                query: expect.objectContaining({ enabled: false }),
            }),
        );
    });

    it("should read each token once and merge the metadata per asset", () => {
        reads([
            { status: "success", result: "USDC" },
            { status: "success", result: 6 },
            { status: "success", result: "BAYC" },
        ]);

        const { result } = renderHook(() =>
            useRefundAssets([erc20, ether, erc721, { ...erc20, value: 1n }]),
        );

        expect(mockReadContracts).toHaveBeenCalledWith(
            expect.objectContaining({
                contracts: [
                    expect.objectContaining({
                        address: token,
                        functionName: "symbol",
                    }),
                    expect.objectContaining({
                        address: token,
                        functionName: "decimals",
                    }),
                    expect.objectContaining({
                        address: otherToken,
                        functionName: "symbol",
                    }),
                ],
                allowFailure: true,
                query: expect.objectContaining({
                    enabled: true,
                    staleTime: Infinity,
                }),
            }),
        );
        expect(result.current).toEqual([
            { ...erc20, symbol: "USDC", decimals: 6 },
            ether,
            { ...erc721, symbol: "BAYC" },
            { ...erc20, value: 1n, symbol: "USDC", decimals: 6 },
        ]);
    });

    it("should leave the metadata out when the reads fail", () => {
        reads([
            { status: "failure", error: new Error("no symbol") },
            { status: "failure", error: new Error("no decimals") },
        ]);

        const { result } = renderHook(() => useRefundAssets([erc20]));

        expect(result.current).toEqual([
            { ...erc20, symbol: undefined, decimals: undefined },
        ]);
    });

    it("should not read when disabled", () => {
        renderHook(() => useRefundAssets([erc20], { enabled: false }));

        expect(mockReadContracts).toHaveBeenCalledWith(
            expect.objectContaining({
                query: expect.objectContaining({ enabled: false }),
            }),
        );
    });
});

describe("useRefundAsset", () => {
    beforeEach(() => {
        mockReadContracts.mockReset();
    });

    it("should resolve a single asset", () => {
        reads([{ status: "success", result: "BAYC" }]);

        const { result } = renderHook(() => useRefundAsset(erc721));

        expect(result.current).toEqual({ ...erc721, symbol: "BAYC" });
    });

    it("should return undefined without an asset and read nothing", () => {
        reads(undefined);

        const { result } = renderHook(() => useRefundAsset(undefined));

        expect(result.current).toBeUndefined();
        expect(mockReadContracts).toHaveBeenCalledWith(
            expect.objectContaining({
                contracts: [],
                query: expect.objectContaining({ enabled: false }),
            }),
        );
    });
});
