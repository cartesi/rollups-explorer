import { afterEach, beforeEach, describe, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFormattedBalance } from "../../src/hooks/useFormattedBalance";
import { useBalance, useAccount } from "wagmi";

vi.mock("wagmi");
const useAccountMock = vi.mocked(useAccount, { partial: true });
const useBalanceMock = vi.mocked(useBalance, { partial: true });

describe("Hooks/useFormattedBalance", () => {
    beforeEach(() => {
        useAccountMock.mockReturnValue({
            address: "0x8FD78976f8955D13bAA4fC99043208F4EC020D7E",
            isConnected: true,
        });
        useBalanceMock.mockReturnValue({
            data: {
                value: 355943959031747438n,
                decimals: 18,
            },
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should return correct formatted value for balance", () => {
        useBalanceMock.mockReturnValue({
            data: {
                value: 355943959031747438n,
                decimals: 18,
            },
        });
        const { result } = renderHook(() => useFormattedBalance());
        expect(result.current).toBe("0.355943959031747438");
    });

    it("should return correct fallback value for balance", () => {
        useBalanceMock.mockReturnValue({
            data: undefined,
        });
        const { result } = renderHook(() => useFormattedBalance());
        expect(result.current).toBe("0");
    });
});
