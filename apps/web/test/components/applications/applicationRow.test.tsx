import { Table } from "@mantine/core";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { FC } from "react";
import { afterEach, beforeEach, describe, it } from "vitest";
import ApplicationRow, {
    ApplicationRowProps,
} from "../../../src/components/applications/applicationRow";
import { useConnectionConfig } from "../../../src/providers/connectionConfig/hooks";
import { withMantineTheme } from "../../utils/WithMantineTheme";

vi.mock("../../../src/providers/connectionConfig/hooks");
const useConnectionConfigMock = vi.mocked(useConnectionConfig, true);

const TableComponent: FC<ApplicationRowProps> = (props) => (
    <Table>
        <Table.Tbody>
            <ApplicationRow {...props} />
        </Table.Tbody>
    </Table>
);

const Component = withMantineTheme(TableComponent);

const defaultProps: ApplicationRowProps = {
    application: {
        id: "0x028367fe226cd9e5699f4288d512fe3a4a4a0012",
        owner: "0x74d093f6911ac080897c3145441103dabb869307",
        timestamp: Math.floor(new Date().getTime() / 1000),
        factory: {
            id: "0x7122cd1221c20892234186facfe8615e6743ab02",
            applications: [],
        },
    },
};

const defaultConnection = {
    address: defaultProps.application.id as `0x${string}`,
    url: "https://echo-python.sepolia.rollups.staging.cartesi.io/graphql",
};

describe("ApplicationRow component", () => {
    beforeEach(() => {
        useConnectionConfigMock.mockReturnValue({
            hasConnection: vi.fn(),
            addConnection: vi.fn(),
            removeConnection: vi.fn(),
            getConnection: vi.fn(),
            hideConnectionModal: vi.fn(),
            showConnectionModal: vi.fn(),
            listConnections: vi.fn(),
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should display shortened application id", () => {
        render(<Component {...defaultProps} />);
        const { application } = defaultProps;
        const appId = application.id;
        const shortenedId = `${appId.slice(0, 8)}...${appId.slice(-6)}`;

        expect(screen.getByText(shortenedId)).toBeInTheDocument();
    });

    it("should display shortened application owner id", () => {
        render(<Component {...defaultProps} />);
        const { application } = defaultProps;
        const ownerId = application?.owner as string;
        const shortenedOwnerId = `${ownerId.slice(0, 8)}...${ownerId.slice(
            -6,
        )}`;

        expect(screen.getByText(shortenedOwnerId)).toBeInTheDocument();
    });

    it("should display N/A when owner is undefined", () => {
        useConnectionConfigMock.mockReturnValue({
            ...useConnectionConfigMock(),
            getConnection: () => defaultConnection,
        });

        render(
            <Component
                application={{
                    ...defaultProps.application,
                    owner: undefined,
                }}
            />,
        );

        expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("should display N/A when no connection exists", () => {
        render(<Component {...defaultProps} />);

        expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("should display connection url when connection exists", () => {
        useConnectionConfigMock.mockReturnValue({
            ...useConnectionConfigMock(),
            getConnection: () => defaultConnection,
        });

        render(<Component {...defaultProps} />);

        expect(screen.getByText(defaultConnection.url)).toBeInTheDocument();
    });

    it("should display link to the application summary page", () => {
        render(<Component {...defaultProps} />);
        const link = screen.getByTestId("applications-summary-link");

        expect(link).toBeInTheDocument();
        expect(link.getAttribute("href")).toBe(
            `/applications/${defaultProps.application.id}`,
        );
    });

    it("should display link to application inputs page", () => {
        render(<Component {...defaultProps} />);
        const link = screen.getByTestId("applications-link");

        expect(link).toBeInTheDocument();
        expect(link.getAttribute("href")).toBe(
            `/applications/${defaultProps.application.id}/inputs`,
        );
    });

    it("should display add connection button when no connection exists", () => {
        render(<Component {...defaultProps} />);
        expect(screen.getByTestId("add-connection")).toBeInTheDocument();
    });

    it("should invoke showConnectionModal with application id, when add-connection button is clicked", () => {
        const showConnectionModalMock = vi.fn();
        useConnectionConfigMock.mockReturnValue({
            ...useConnectionConfigMock(),
            showConnectionModal: showConnectionModalMock,
        });

        render(<Component {...defaultProps} />);

        const addConnectionButton = screen.getByTestId("add-connection");

        fireEvent.click(addConnectionButton);

        expect(showConnectionModalMock).toHaveBeenCalledWith(
            defaultProps.application.id,
        );
    });

    it("should display remove connection button when connection exists", () => {
        useConnectionConfigMock.mockReturnValue({
            ...useConnectionConfigMock(),
            hasConnection: () => true,
        });
        render(<Component {...defaultProps} />);
        expect(screen.getByTestId("remove-connection")).toBeInTheDocument();
    });

    it("should invoke removeConnection with application id, when remove-connection button is clicked", () => {
        const removeConnectionMock = vi.fn();
        useConnectionConfigMock.mockReturnValue({
            ...useConnectionConfigMock(),
            hasConnection: () => true,
            removeConnection: removeConnectionMock,
        });

        render(<Component {...defaultProps} />);

        const addConnectionButton = screen.getByTestId("remove-connection");

        fireEvent.click(addConnectionButton);

        expect(removeConnectionMock).toHaveBeenCalledWith(
            defaultProps.application.id,
        );
    });
});
