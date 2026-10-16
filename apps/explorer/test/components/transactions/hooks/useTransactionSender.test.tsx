import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTransactionSender } from "../../../../src/components/transactions/hooks/useTransactionSender";

const mocks = vi.hoisted(() => ({
    useAccount: vi.fn(),
    useConnectModal: vi.fn(),
    useChainModal: vi.fn(),
    useSelectedNodeConnection: vi.fn(),
    openConnectModal: vi.fn(),
    openChainModal: vi.fn(),
}));

vi.mock("wagmi", () => ({ useAccount: mocks.useAccount }));
vi.mock("@rainbow-me/rainbowkit", () => ({
    useConnectModal: mocks.useConnectModal,
    useChainModal: mocks.useChainModal,
}));
vi.mock("../../../../src/components/connection/hooks", () => ({
    useSelectedNodeConnection: mocks.useSelectedNodeConnection,
}));

describe("useTransactionSender", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.useConnectModal.mockReturnValue({
            openConnectModal: mocks.openConnectModal,
        });
        mocks.useChainModal.mockReturnValue({
            openChainModal: mocks.openChainModal,
        });
        mocks.useSelectedNodeConnection.mockReturnValue({ type: "user" });
        mocks.useAccount.mockReturnValue({
            isConnected: true,
            chain: { id: 31337 },
        });
    });

    it("should run the write when a wallet is connected on a known chain", () => {
        const write = vi.fn();
        const { result } = renderHook(() => useTransactionSender());

        result.current.send(write);

        expect(result.current.canSend).toBe(true);
        expect(result.current.hidden).toBe(false);
        expect(write).toHaveBeenCalledOnce();
        expect(mocks.openConnectModal).not.toHaveBeenCalled();
    });

    it("should open the connect modal when no wallet is connected", () => {
        mocks.useAccount.mockReturnValue({ isConnected: false });
        const write = vi.fn();
        const { result } = renderHook(() => useTransactionSender());

        result.current.send(write);

        expect(result.current.canSend).toBe(false);
        expect(mocks.openConnectModal).toHaveBeenCalledOnce();
        expect(write).not.toHaveBeenCalled();
    });

    it("should open the chain modal when the wallet is on an unknown chain", () => {
        mocks.useAccount.mockReturnValue({
            isConnected: true,
            chain: undefined,
        });
        const write = vi.fn();
        const { result } = renderHook(() => useTransactionSender());

        result.current.send(write);

        expect(result.current.canSend).toBe(false);
        expect(mocks.openChainModal).toHaveBeenCalledOnce();
        expect(mocks.openConnectModal).not.toHaveBeenCalled();
        expect(write).not.toHaveBeenCalled();
    });

    it("should hide the action on the mocked node connection", () => {
        mocks.useSelectedNodeConnection.mockReturnValue({
            type: "system_mock",
        });
        const { result } = renderHook(() => useTransactionSender());

        expect(result.current.hidden).toBe(true);
    });
});
