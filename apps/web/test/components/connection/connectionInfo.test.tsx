import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
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

    it("should open the confirmation modal when clicking on the trash icon", async () => {
        render(<ConnectionInfo connection={connections[0]} />, {
            wrapper: StyleProvider,
        });

        const button = screen.getByRole("button", {
            name: `remove-${connections[0].address}`,
        });

        fireEvent.click(button);

        await waitFor(() => screen.getByText("Delete connection?"));
        expect(
            screen.getByText(
                "This will delete the data for this connection. Are you sure you want to proceed?",
            ),
        ).toBeInTheDocument();
    });

    it("should close the confirmation modal when clicking on cancel button", async () => {
        const [connection] = connections;
        render(<ConnectionInfo connection={connection} />, {
            wrapper: StyleProvider,
        });

        const button = screen.getByRole("button", {
            name: `remove-${connection.address}`,
        });

        fireEvent.click(button);

        await waitFor(() => screen.getByText("Delete connection?"));
        expect(
            screen.getByText(
                "This will delete the data for this connection. Are you sure you want to proceed?",
            ),
        ).toBeInTheDocument();

        const cancelButton = screen.getByText("Cancel");
        fireEvent.click(cancelButton);

        await waitFor(() =>
            expect(() => screen.getByText("Delete connection?")).toThrow(
                "Unable to find an element with the text: Delete connection?",
            ),
        );

        expect(screen.getByText(connection.url)).toBeInTheDocument();
    });

    it("should call the remove action when confirming the connection deletion", async () => {
        const [connection] = connections;
        render(<ConnectionInfo connection={connection} />, {
            wrapper: StyleProvider,
        });

        const button = screen.getByRole("button", {
            name: `remove-${connection.address}`,
        });

        fireEvent.click(button);

        await waitFor(() => screen.getByText("Delete connection?"));
        expect(
            screen.getByText(
                "This will delete the data for this connection. Are you sure you want to proceed?",
            ),
        ).toBeInTheDocument();

        const confirmButton = screen.getByText("Confirm");
        fireEvent.click(confirmButton);

        await waitFor(() =>
            expect(() => screen.getByText("Delete connection?")).toThrow(
                "Unable to find an element with the text: Delete connection?",
            ),
        );

        expect(useConnMock().removeConnection).toHaveBeenCalledOnce();
        expect(useConnMock().removeConnection).toHaveBeenCalledWith(
            "0x70ac08179605AF2D9e75782b8DEcDD3c22aA4D0C",
        );
    });
});
