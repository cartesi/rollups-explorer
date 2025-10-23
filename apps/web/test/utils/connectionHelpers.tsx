import { vi } from "vitest";
import { useConnectionConfig } from "../../src/providers/connectionConfig/hooks";

type UseConnectionConfigReturn = ReturnType<typeof useConnectionConfig>;

const connectionStubs: UseConnectionConfigReturn = {
    hasConnection: vi.fn(),
    addConnection: vi.fn(),
    removeConnection: vi.fn(),
    getConnection: vi.fn(),
    hideConnectionModal: vi.fn(),
    showConnectionModal: vi.fn(),
    listConnections: vi.fn(),
    fetching: false,
};

/**
 * TS helper for intellisense and autocompletion for methods like `mockReturnValue`
 */
export const useConnectionConfigReturnStub: UseConnectionConfigReturn =
    vi.mocked(connectionStubs, {
        partial: true,
    });
