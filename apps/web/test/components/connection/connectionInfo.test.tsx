import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { describe, it } from "vitest";
import ConnectionInfo from "../../../src/components/connection/connectionInfo";
import { useConnectionConfig } from "../../../src/providers/connectionConfig/hooks";
import StyleProvider from "../../../src/providers/styleProvider";
import { connections } from "../../providers/connectionConfig/mocks";

vi.mock("../../../src/providers/connectionConfig/hooks");

const useConnMock = vi.mocked(useConnectionConfig, true);

describe("Connection info component", () => {
    beforeEach(() => {
        useConnMock.mockReturnValue({
            removeConnection: vi.fn(),
            addConnection: vi.fn(),
            hasConnection: vi.fn(),
            getConnection: vi.fn(),
            hideConnectionModal: vi.fn(),
            listConnections: vi.fn(),
            showConnectionModal: vi.fn(),
            fetching: false,
        });
    });
    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should display connection information", () => {
        render(<ConnectionInfo connection={connections[0]} />, {
            wrapper: StyleProvider,
        });

        expect(screen.getByText("0x70ac08...aA4D0C")).toBeInTheDocument();
        expect(screen.getByText("http://localhost:3000")).toBeInTheDocument();
        expect(
            screen.getByRole("button", {
                name: `remove-0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C`,
            }),
        ).toBeInTheDocument();
    });

    it("should call the remove action when clicking on the trash icon", async () => {
        render(<ConnectionInfo connection={connections[0]} />, {
            wrapper: StyleProvider,
        });

        const button = screen.getByRole("button", {
            name: `remove-${connections[0].address}`,
        });

        fireEvent.click(button);

        expect(useConnMock().removeConnection).toHaveBeenCalledOnce();
        expect(useConnMock().removeConnection).toHaveBeenCalledWith(
            "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C",
        );
    });
});
