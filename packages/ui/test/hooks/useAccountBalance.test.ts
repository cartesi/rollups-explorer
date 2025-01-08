import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, vi } from "vitest";
import { useAccount, useBalance } from "wagmi";
import { useAccountBalance } from "../../src/hooks/useAccountBalance";

vi.mock("wagmi");

const useAccountMock = vi.mocked(useAccount, { partial: true });
const useBalanceMock = vi.mocked(useBalance, { partial: true });
const balanceRefetchMock = vi.fn();

const ethBalance = 456632268985698099n;
const ethDecimals = 18;
const ethSymbol = "ETH";

describe("UseAccountBalance Hook", () => {
    beforeEach(() => {
        useAccountMock.mockReturnValue({
            address: "0xCF6bd2F07c24C50BDDf5Ed3c1858f9aDECB727cE",
            isConnected: true,
        });
        useBalanceMock.mockReturnValue({
            data: {
                value: ethBalance,
                decimals: ethDecimals,
                symbol: ethSymbol,
            },
            refetch: balanceRefetchMock,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should return information about the connected account", () => {
        const { result } = renderHook(() => useAccountBalance());

        expect(result.current.symbol).toEqual("ETH");
        expect(result.current.value).toEqual(ethBalance);
        expect(result.current.decimals).toEqual(18);
        expect(result.current.formatted).toEqual("0.456632268985698099");
        expect(result.current.refetch).toEqual(expect.any(Function));
    });

    it("should return defaults in case the data is undefined", () => {
        useBalanceMock.mockReturnValue({
            data: undefined,
            refetch: balanceRefetchMock,
        });

        const { result } = renderHook(() => useAccountBalance());

        expect(result.current.symbol).toEqual("ETH");
        expect(result.current.value).toEqual(0n);
        expect(result.current.decimals).toEqual(18);
        expect(result.current.formatted).toEqual("0");
        expect(result.current.refetch).toEqual(expect.any(Function));
    });
});
