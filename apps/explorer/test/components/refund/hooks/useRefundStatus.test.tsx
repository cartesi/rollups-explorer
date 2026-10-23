import { useReadIApplicationWasRefundForInputIssued } from "@cartesi/react";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useReadContracts } from "wagmi";
import {
    useRefundStatus,
    useRefundStatuses,
} from "../../../../src/components/refund/hooks/useRefundStatus";

vi.mock("@cartesi/react", () => ({
    iApplicationAbi: [],
    useReadIApplicationWasRefundForInputIssued: vi.fn(),
}));

vi.mock("wagmi", () => ({
    useReadContracts: vi.fn(),
}));

const mockRead = vi.mocked(useReadIApplicationWasRefundForInputIssued);
const mockReadContracts = vi.mocked(useReadContracts);
const application = "0x40a7C73a6a592D8697bE97254E273E6f3FB46000";

describe("useRefundStatus", () => {
    const refetch = vi.fn();

    beforeEach(() => {
        mockRead.mockReset();
        mockRead.mockReturnValue({
            data: true,
            isLoading: false,
            error: null,
            refetch,
        } as never);
    });

    it("should read the refund flag of the input", () => {
        const { result } = renderHook(() => useRefundStatus(application, 7n));

        expect(mockRead).toHaveBeenCalledWith({
            address: application,
            args: [7n],
            query: { enabled: true },
        });
        expect(result.current.refundIssued).toBe(true);
        expect(result.current.refetch).toBe(refetch);
    });

    it("should not read without an application or input", () => {
        renderHook(() => useRefundStatus(undefined, 7n));
        renderHook(() => useRefundStatus(application, undefined));

        expect(mockRead).toHaveBeenNthCalledWith(1, {
            address: undefined,
            args: [7n],
            query: { enabled: false },
        });
        expect(mockRead).toHaveBeenNthCalledWith(2, {
            address: application,
            args: undefined,
            query: { enabled: false },
        });
    });

    it("should honour the enabled option", () => {
        renderHook(() => useRefundStatus(application, 7n, { enabled: false }));

        expect(mockRead).toHaveBeenCalledWith(
            expect.objectContaining({ query: { enabled: false } }),
        );
    });
});

describe("useRefundStatuses", () => {
    beforeEach(() => {
        mockReadContracts.mockReset();
    });

    it("should batch one read per input and map the results", () => {
        mockReadContracts.mockReturnValue({
            data: [
                { status: "success", result: false },
                { status: "failure", error: new Error("boom") },
                { status: "success", result: true },
            ],
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        } as never);

        const { result } = renderHook(() =>
            useRefundStatuses(application, [3n, 2n, 1n]),
        );

        expect(mockReadContracts).toHaveBeenCalledWith(
            expect.objectContaining({
                contracts: [3n, 2n, 1n].map((inputIndex) =>
                    expect.objectContaining({
                        address: application,
                        functionName: "wasRefundForInputIssued",
                        args: [inputIndex],
                    }),
                ),
                allowFailure: true,
                query: { enabled: true },
            }),
        );
        expect([...result.current.byIndex]).toEqual([
            [3n, false],
            [1n, true],
        ]);
        expect([...result.current.failed]).toEqual([2n]);
    });

    it("should keep the cached flags when a refetch fails", () => {
        mockReadContracts.mockReturnValue({
            data: [
                { status: "success", result: false },
                { status: "success", result: true },
            ],
            isLoading: false,
            isError: true,
            error: new Error("rpc down"),
            refetch: vi.fn(),
        } as never);

        const { result } = renderHook(() =>
            useRefundStatuses(application, [3n, 2n]),
        );

        expect([...result.current.byIndex]).toEqual([
            [3n, false],
            [2n, true],
        ]);
        expect(result.current.failed.size).toBe(0);
    });

    it("should mark every input as failed when the batch read fails", () => {
        mockReadContracts.mockReturnValue({
            data: undefined,
            isLoading: false,
            isError: true,
            error: new Error("rpc down"),
            refetch: vi.fn(),
        } as never);

        const { result } = renderHook(() =>
            useRefundStatuses(application, [3n, 2n]),
        );

        expect(result.current.byIndex.size).toBe(0);
        expect([...result.current.failed]).toEqual([3n, 2n]);
    });

    it("should not read an empty list", () => {
        mockReadContracts.mockReturnValue({
            data: undefined,
            isLoading: false,
            error: null,
            refetch: vi.fn(),
        } as never);

        const { result } = renderHook(() => useRefundStatuses(application, []));

        expect(mockReadContracts).toHaveBeenCalledWith(
            expect.objectContaining({ query: { enabled: false } }),
        );
        expect(result.current.byIndex.size).toBe(0);
    });
});
