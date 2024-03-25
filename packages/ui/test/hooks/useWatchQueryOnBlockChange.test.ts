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

    it('should invoke "invalidateQueries" function on block number change', async () => {
        const queryKey = ["query-key"];
        const invalidateQueriesMock = vi.fn(() => Promise.resolve());
        useQueryClientMock.mockReturnValue({
            invalidateQueries: invalidateQueriesMock,
        } as any);
        renderHook(() => useWatchQueryOnBlockChange(queryKey));

        await waitFor(() =>
            expect(invalidateQueriesMock).toHaveBeenCalledWith({
                queryKey,
            }),
        );
    });
});
