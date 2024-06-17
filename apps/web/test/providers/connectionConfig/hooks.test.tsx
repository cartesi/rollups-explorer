import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, it } from "vitest";
import { useConnectionConfig } from "../../../src/providers/connectionConfig/hooks";
import localRepository from "../../../src/providers/connectionConfig/localRepository";
import { address, connections } from "./mocks";
import { providerWrapperBuilder } from "./utils";

vi.mock("../../../src/providers/connectionConfig/localRepository");
const repositoryMock = vi.mocked(localRepository, true);

describe("Connection config hooks", () => {
    let connectionProviderWrapper: ReturnType<typeof providerWrapperBuilder>;

    beforeEach(() => {
        // happy results
        repositoryMock.list.mockResolvedValue(connections);
        repositoryMock.add.mockResolvedValue(connections[0]);
        repositoryMock.remove.mockResolvedValue(true);
        repositoryMock.has.mockResolvedValue(true);
        connectionProviderWrapper = providerWrapperBuilder({ connections });
    });

    afterEach(() => {
        cleanup();
        vi.resetAllMocks();
    });

    it("should provide helper function to interact with the connection config", () => {
        const { result } = renderHook(() => useConnectionConfig());

        const propNames = Object.keys(result.current).sort();
        expect(propNames).toEqual([
            "addConnection",
            "fetching",
            "getConnection",
            "hasConnection",
            "hideConnectionModal",
            "listConnections",
            "removeConnection",
            "showConnectionModal",
        ]);
    });

    it("should list all connection available", () => {
        const { result } = renderHook(() => useConnectionConfig(), {
            wrapper: connectionProviderWrapper,
        });
        expect(result.current.listConnections()).toHaveLength(2);
        expect(result.current.listConnections()[0]).toHaveProperty(
            "address",
            "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C",
        );
        expect(result.current.listConnections()[1]).toHaveProperty(
            "address",
            "0xC0bF2492b753C10eB3C7f584f8F5C667e1e5a3f5",
        );
    });

    it("should tell if a connection exist", () => {
        const { result } = renderHook(() => useConnectionConfig(), {
            wrapper: connectionProviderWrapper,
        });
        expect(
            result.current.hasConnection(
                "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C",
            ),
        ).toEqual(true);
    });

    it("should tell if a connection does not exist", () => {
        const { result } = renderHook(() => useConnectionConfig(), {
            wrapper: connectionProviderWrapper,
        });
        expect(result.current.hasConnection(address)).toEqual(false);
    });

    it("should retrieve a existing connection", () => {
        const existingConnAddress =
            "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C";
        const { result } = renderHook(() => useConnectionConfig(), {
            wrapper: connectionProviderWrapper,
        });
        expect(result.current.getConnection(existingConnAddress)).toEqual({
            address: "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C",
            timestamp: 1,
            url: "http://localhost:3000",
        });
    });

    it("should return undefined when retrieving an non-existing connection", () => {
        const randomAddress = "0x0";
        const { result } = renderHook(() => useConnectionConfig(), {
            wrapper: connectionProviderWrapper,
        });
        expect(result.current.getConnection(randomAddress)).toBeUndefined();
    });

    describe("Add connection", () => {
        it("should have a lifecycle callback for success", async () => {
            const { result } = renderHook(() => useConnectionConfig());
            const { addConnection, removeConnection } = result.current;

            const expectedResult = await new Promise((resolve) => {
                addConnection(connections[0], {
                    onSuccess: () => resolve(true),
                });
            });
            expect(expectedResult).toBeTruthy();
        });

        it("should have a lifecycle callback for failure", async () => {
            const error = new Error("some-reason");
            repositoryMock.add.mockRejectedValueOnce(error);
            const { result } = renderHook(() => useConnectionConfig());
            const { addConnection } = result.current;

            const expectedResult = await new Promise((resolve) => {
                addConnection(connections[0], {
                    onFailure: (reason) => resolve(reason),
                });
            });

            expect(expectedResult).toEqual(error);
        });

        it("should have a lifecycle callback when finished", async () => {
            const { result } = renderHook(() => useConnectionConfig());
            const { addConnection } = result.current;

            const expectedResult = await new Promise((resolve) => {
                addConnection(
                    { address, url: "localhost" },
                    {
                        onFinished: () => resolve(true),
                    },
                );
            });
            expect(expectedResult).toEqual(true);
        });
    });

    describe("Remove connection", () => {
        beforeEach(() => {});

        it("should have a lifecycle callback for success", async () => {
            const { result } = renderHook(() => useConnectionConfig());
            const { removeConnection } = result.current;

            const expectedResult = await new Promise((resolve) => {
                removeConnection(address, {
                    onSuccess: () => resolve(true),
                });
            });
            expect(expectedResult).toBeTruthy();
        });

        it("should have a lifecycle callback for failure", async () => {
            const error = new Error("some-reason");
            repositoryMock.remove.mockRejectedValueOnce(error);
            const { result } = renderHook(() => useConnectionConfig());
            const { removeConnection } = result.current;

            const expectedResult = await new Promise((resolve) => {
                removeConnection(address, {
                    onFailure: (reason) => resolve(reason),
                });
            });

            expect(expectedResult).toEqual(error);
        });

        it("should have a lifecycle callback when finished", async () => {
            const { result } = renderHook(() => useConnectionConfig());
            const { removeConnection } = result.current;

            const expectedResult = await new Promise((resolve) => {
                removeConnection(address, {
                    onFinished: () => resolve(true),
                });
            });
            expect(expectedResult).toEqual(true);
        });
    });
});
