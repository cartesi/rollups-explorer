import { Table } from "@mantine/core";
import {
    cleanup,
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import prettyMilliseconds from "pretty-ms";
import type { FC } from "react";
import { afterEach, beforeEach, describe, it } from "vitest";
import UserApplicationsRow, {
    UserApplicationsRowProps,
} from "../../../src/components/applications/userApplicationsRow";
import { RollupVersion } from "@cartesi/rollups-explorer-domain/explorer-types";
import { useConnectionConfig } from "../../../src/providers/connectionConfig/hooks";
import { withMantineTheme } from "../../utils/WithMantineTheme";

vi.mock("../../../src/providers/connectionConfig/hooks");

vi.mock("viem", async () => {
    const actual = await vi.importActual("viem");
    return {
        ...(actual as any),
        getAddress: (address: string) => address,
    };
});

const useConnectionConfigMock = vi.mocked(useConnectionConfig, true);

const TableComponent: FC<UserApplicationsRowProps> = (props) => (
    <Table>
        <Table.Tbody>
            <UserApplicationsRow {...props} />
        </Table.Tbody>
    </Table>
);

const Component = withMantineTheme(TableComponent);

const defaultProps: UserApplicationsRowProps = {
    application: {
        id: "11155111-0x028367fe226cd9e5699f4288d512fe3a4a4a0012-v1",
        owner: "0x74d093f6911ac080897c3145441103dabb869307",
        timestamp: 1700593992,
        chain: {
            id: "11155111",
        },
        factory: {
            id: "11155111-0x7122cd1221c20892234186facfe8615e6743ab02",
            applications: [],
            address: "0x7122cd1221c20892234186facfe8615e6743ab02",
            chain: {
                id: "11155111",
            },
        },
        address: "0x028367fe226cd9e5699f4288d512fe3a4a4a0012",
        rollupVersion: RollupVersion.V1,
    },
    keepDataColVisible: false,
    timeType: "age",
};

const defaultConnection = {
    address: defaultProps.application.id as `0x${string}`,
    url: "https://echo-python.sepolia.rollups.staging.cartesi.io/graphql",
};

describe("UserApplicationRow component", () => {
    beforeEach(() => {
        useConnectionConfigMock.mockReturnValue({
            hasConnection: vi.fn(),
            addConnection: vi.fn(),
            removeConnection: vi.fn(),
            getConnection: vi.fn(),
            hideConnectionModal: vi.fn(),
            showConnectionModal: vi.fn(),
            listConnections: vi.fn(),
            fetching: false,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should display shortened application address", () => {
        render(<Component {...defaultProps} />);
        const { application } = defaultProps;
        const appId = application.address;
        const shortenedId = `${appId.slice(0, 8)}...${appId.slice(-6)}`;

        expect(screen.getByText(shortenedId)).toBeInTheDocument();
    });

    it("should display the correct age", () => {
        render(<Component {...defaultProps} />);
        const { application } = defaultProps;

        const age = `${prettyMilliseconds(
            Date.now() - application.timestamp * 1000,
            {
                unitCount: 2,
                secondsDecimalDigits: 0,
                verbose: true,
            },
        )} ago`;
        expect(screen.getByText(age)).toBeInTheDocument();
    });

    it("should display the correct timestamp", () => {
        render(<Component {...defaultProps} timeType="timestamp" />);
        const { application } = defaultProps;

        const timestamp = new Date(application.timestamp * 1000).toISOString();
        expect(screen.getByText(timestamp)).toBeInTheDocument();
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

    it("should display link to application summary page", () => {
        render(<Component {...defaultProps} />);
        const link = screen.getByTestId("applications-summary-link");

        expect(link).toBeInTheDocument();
        expect(link.getAttribute("href")).toBe(
            `/applications/${defaultProps.application.address}/${defaultProps.application.rollupVersion}`,
        );
    });

    it("should display link to application inputs page", () => {
        render(<Component {...defaultProps} />);
        const link = screen.getByTestId("applications-link");

        expect(link).toBeInTheDocument();
        expect(link.getAttribute("href")).toBe(
            `/applications/${defaultProps.application.address}/${defaultProps.application.rollupVersion}/inputs`,
        );
    });

    it("should display add connection button when no connection exists", () => {
        render(<Component {...defaultProps} />);
        expect(screen.getByTestId("add-connection")).toBeInTheDocument();
    });

    it("should invoke showConnectionModal with application address, when add-connection button is clicked", () => {
        const showConnectionModalMock = vi.fn();
        useConnectionConfigMock.mockReturnValue({
            ...useConnectionConfigMock(),
            showConnectionModal: showConnectionModalMock,
        });

        render(<Component {...defaultProps} />);

        const addConnectionButton = screen.getByTestId("add-connection");

        fireEvent.click(addConnectionButton);

        expect(showConnectionModalMock).toHaveBeenCalledWith(
            defaultProps.application.address,
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

    it("should open the confirmation modal when clicking on the trash icon", async () => {
        useConnectionConfigMock.mockReturnValue({
            ...useConnectionConfigMock(),
            hasConnection: () => true,
        });
        render(<Component {...defaultProps} />);
        const removeConnectionButton = screen.getByTestId("remove-connection");
        fireEvent.click(removeConnectionButton);

        await waitFor(() => screen.getByText("Delete connection?"));
        expect(
            screen.getByText(
                "This will delete the data for this connection. Are you sure you want to proceed?",
            ),
        ).toBeInTheDocument();
    });

    it("should close the confirmation modal when clicking on cancel button", async () => {
        useConnectionConfigMock.mockReturnValue({
            ...useConnectionConfigMock(),
            hasConnection: () => true,
        });
        render(<Component {...defaultProps} />);
        const removeConnectionButton = screen.getByTestId("remove-connection");
        fireEvent.click(removeConnectionButton);

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
    });

    it("should call the remove action when confirming the connection deletion", async () => {
        const removeConnectionSpy = vi.fn();
        useConnectionConfigMock.mockReturnValue({
            ...useConnectionConfigMock(),
            hasConnection: () => true,
            removeConnection: removeConnectionSpy,
        });
        render(<Component {...defaultProps} />);
        const removeConnectionButton = screen.getByTestId("remove-connection");
        fireEvent.click(removeConnectionButton);

        await waitFor(() => screen.getByText("Delete connection?"));
        expect(
            screen.getByText(
                "This will delete the data for this connection. Are you sure you want to proceed?",
            ),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByText("Confirm"));

        expect(removeConnectionSpy).toHaveBeenCalledWith(
            defaultProps.application.address,
        );
    });
});
