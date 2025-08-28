import { describe, it, beforeAll, afterAll, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import useWatchQueryOnBlockChange from "../../src/hooks/useWatchQueryOnBlockChange";
import { useQueryClient } from "@tanstack/react-query";
import { useBlockNumber } from "wagmi";

vi.mock("wagmi");
vi.mock("@tanstack/react-query");

const useBlockNumberMock = vi.mocked(useBlockNumber, true);
const useQueryClientMock = vi.mocked(useQueryClient, true);

describe("useWatchQueryOnBlockChange hook", () => {
    beforeAll(() => {
        useBlockNumberMock.mockReturnValue({
            data: 0,
        } as any);
        useQueryClientMock.mockReturnValue({
            invalidateQueries: () => Promise.resolve(),
        } as any);
    });

    afterAll(() => {
        vi.clearAllMocks();
    });

    it('should not initially invoke "invalidateQueries" function when block has not changed', async () => {
        const queryKey = ["query-key"];
        const invalidateQueriesMock = vi.fn(() => Promise.resolve());
        useQueryClientMock.mockReturnValue({
            invalidateQueries: invalidateQueriesMock,
        } as any);
        renderHook(() => useWatchQueryOnBlockChange(queryKey));

        await waitFor(() =>
            expect(invalidateQueriesMock).toHaveBeenCalledTimes(0),
        );
    });

    it('should not invoke "invalidateQueries" function if query key and block number are the same', async () => {
        const queryKey = ["query-key"];
        let invalidateQueriesMock = vi.fn(() => Promise.resolve());
        useQueryClientMock.mockReturnValue({
            invalidateQueries: invalidateQueriesMock,
        } as any);
        const { rerender } = renderHook(() =>
            useWatchQueryOnBlockChange(queryKey),
        );

        await waitFor(() =>
            expect(invalidateQueriesMock).toHaveBeenCalledTimes(0),
        );

        invalidateQueriesMock = vi.fn(() => Promise.resolve());
        useQueryClientMock.mockReturnValue({
            invalidateQueries: invalidateQueriesMock,
        } as any);

        rerender({ queryKey: ["query-key"] });

        await waitFor(() =>
            expect(invalidateQueriesMock).toHaveBeenCalledTimes(0),
        );
    });

    it('should not invoke "invalidateQueries" function if query key has changed but block number is the same', async () => {
        const queryKey = ["query-key"];
        let invalidateQueriesMock = vi.fn(() => Promise.resolve());
        useQueryClientMock.mockReturnValue({
            invalidateQueries: invalidateQueriesMock,
        } as any);
        const { rerender } = renderHook(() =>
            useWatchQueryOnBlockChange(queryKey),
        );

        await waitFor(() =>
            expect(invalidateQueriesMock).toHaveBeenCalledTimes(0),
        );

        invalidateQueriesMock = vi.fn(() => Promise.resolve());
        useQueryClientMock.mockReturnValue({
            invalidateQueries: invalidateQueriesMock,
        } as any);

        rerender({ queryKey: ["next-query-key"] });

        await waitFor(() =>
            expect(invalidateQueriesMock).toHaveBeenCalledTimes(0),
        );
    });

    it('should invoke "invalidateQueries" function if block number has changed', async () => {
        const queryKey = ["query-key"];
        let invalidateQueriesMock = vi.fn(() => Promise.resolve());
        useQueryClientMock.mockReturnValue({
            invalidateQueries: invalidateQueriesMock,
        } as any);
        const { rerender } = renderHook(() =>
            useWatchQueryOnBlockChange(queryKey),
        );

        await waitFor(() =>
            expect(invalidateQueriesMock).toHaveBeenCalledTimes(0),
        );

        invalidateQueriesMock = vi.fn(() => Promise.resolve());
        useQueryClientMock.mockReturnValue({
            invalidateQueries: invalidateQueriesMock,
        } as any);
        useBlockNumberMock.mockReturnValue({
            data: 1n,
        } as any);

        rerender({ queryKey: ["query-key"] });

        await waitFor(() =>
            expect(invalidateQueriesMock).toHaveBeenCalledTimes(1),
        );
    });
});
