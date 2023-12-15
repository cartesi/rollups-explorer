import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, it } from "vitest";
import ConnectionView from "../../src/components/connection/connectionView";
import { useConnectionConfig } from "../../src/providers/connectionConfig/hooks";
import { connections } from "../providers/connectionConfig/mocks";
import withMantineTheme from "../utils/WithMantineTheme";
import { useConnectionConfigReturnStub } from "../utils/connectionHelpers";

vi.mock("../../src/providers/connectionConfig/hooks");

const View = withMantineTheme(ConnectionView);
const useConnectionConfigMock = vi.mocked(useConnectionConfig, true);

describe("Connection view component", () => {
    beforeEach(() => {
        useConnectionConfigReturnStub.listConnections.mockReturnValue([]);
        useConnectionConfigMock.mockReturnValue(useConnectionConfigReturnStub);
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should display default state without connections", () => {
        render(<View />);

        expect(screen.getByText("Create connection")).toBeInTheDocument();
        expect(screen.getByText("Connections")).toBeInTheDocument();
        expect(
            screen.getByText("Create your first connection."),
        ).toBeInTheDocument();
    });

    it("should call the creation form when clicking the plus sign", () => {
        const { showConnectionModal } = useConnectionConfigReturnStub;

        render(<View />);

        fireEvent.click(screen.getByText("Create connection"));

        expect(showConnectionModal).toHaveBeenCalledOnce();
    });

    it("should list the connection presenting the shorten address and url", () => {
        const { listConnections } = useConnectionConfigReturnStub;
        listConnections.mockReturnValue(connections);

        render(<View />);

        expect(screen.getByText("0x70ac08...aA4D0C")).toBeInTheDocument();
        expect(
            screen.getByText(
                `Remove connection for address ${connections[0].address}`,
            ),
        );
        expect(screen.getByText(connections[0].url)).toBeInTheDocument();
        expect(screen.getByText("0xC0bF24...e5a3f5")).toBeInTheDocument();
        expect(
            screen.getByText(
                `Remove connection for address ${connections[1].address}`,
            ),
        );
        expect(screen.getByText(connections[1].url)).toBeInTheDocument();
    });

    it("should call the remove connection correctly when clicking the trash can", () => {
        const { removeConnection, listConnections } =
            useConnectionConfigReturnStub;
        listConnections.mockReturnValue(connections);

        render(<View />);

        fireEvent.click(
            screen.getByText(
                `Remove connection for address ${connections[0].address}`,
            ),
        );

        expect(removeConnection).toHaveBeenCalledWith(connections[0].address);
    });

    it("should hide the connections when clicking the chevron-up icon", () => {
        const { listConnections } = useConnectionConfigReturnStub;
        listConnections.mockReturnValue(connections);

        render(<View />);

        expect(screen.queryByText(connections[0].url)).toBeVisible();

        fireEvent.click(screen.getByText("Hide connections"));

        expect(screen.queryByText(connections[0].url)).not.toBeVisible();
    });

    it("should show the connections when clicking the chevron-down icon", () => {
        const { listConnections } = useConnectionConfigReturnStub;
        listConnections.mockReturnValue(connections);

        render(<View />);

        fireEvent.click(screen.getByText("Hide connections"));
        expect(screen.queryByText(connections[0].url)).not.toBeVisible();

        fireEvent.click(screen.getByText("Show connections"));
        expect(screen.queryByText(connections[0].url)).toBeVisible();
    });
});
