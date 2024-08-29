import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, it } from "vitest";
import ApplicationSummary from "../../../src/components/applications/applicationSummary";
import { useInputsConnectionQuery } from "../../../src/graphql/explorer/hooks/queries";
import { InputOrderByInput } from "../../../src/graphql/explorer/types";
import { useConnectionConfig } from "../../../src/providers/connectionConfig/hooks";
import { withMantineTheme } from "../../utils/WithMantineTheme";
import { inputsConnectionMock } from "./mocks";

vi.mock("../../../src/providers/connectionConfig/hooks");
const useConnectionConfigMock = vi.mocked(useConnectionConfig, true);

vi.mock("../../../src/graphql/explorer/hooks/queries");
const useInputsConnectionQueryMock = vi.mocked(useInputsConnectionQuery, true);

const Component = withMantineTheme(ApplicationSummary);

const defaultProps = {
    applicationId: "0x07044f5d4ae00666bbb946cf1cbcff8e2d29c878",
};

const connectionConfig = {
    hasConnection: vi.fn(),
    addConnection: vi.fn(),
    removeConnection: vi.fn(),
    getConnection: vi.fn(),
    hideConnectionModal: vi.fn(),
    showConnectionModal: vi.fn(),
    listConnections: vi.fn(),
    fetching: false,
};

describe("ApplicationSummary component", () => {
    beforeEach(() => {
        useConnectionConfigMock.mockReturnValue(connectionConfig);
        useInputsConnectionQueryMock.mockReturnValue([
            {
                data: inputsConnectionMock,
                fetching: false,
            },
        ] as any);
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should filter applications based on application id", () => {
        const implementationMock = vi.fn(
            () =>
                [
                    {
                        data: inputsConnectionMock,
                        fetching: false,
                    },
                ] as any,
        );
        useInputsConnectionQueryMock.mockImplementation(implementationMock);
        render(<Component {...defaultProps} />);

        expect(implementationMock).toHaveBeenCalledWith({
            variables: {
                orderBy: InputOrderByInput.TimestampDesc,
                limit: 6,
                where: {
                    application: {
                        address_eq: defaultProps.applicationId.toLowerCase(),
                        chain: {
                            id_eq: "11155111",
                        },
                    },
                },
            },
        });
    });

    it("should display summary card for inputs", () => {
        render(<Component {...defaultProps} />);
        expect(screen.getByText("Inputs")).toBeInTheDocument();
    });

    it("should display correct number of inputs", () => {
        render(<Component {...defaultProps} />);
        expect(
            screen.getByText(inputsConnectionMock.inputsConnection.totalCount),
        ).toBeInTheDocument();
    });

    it("should display skeleton cards when no connection is available", () => {
        useConnectionConfigMock.mockReturnValue({
            ...connectionConfig,
            hasConnection: () => false,
        });
        render(<Component {...defaultProps} />);
        expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    });

    it("should display Add connection button when no connection is available", () => {
        useConnectionConfigMock.mockReturnValue({
            ...connectionConfig,
            hasConnection: () => false,
        });
        render(<Component {...defaultProps} />);
        expect(screen.getByText("Add connection")).toBeInTheDocument();
    });

    it("should invoke showConnectionModal when Add connection button is clicked", () => {
        const showConnectionModalMock = vi.fn();
        useConnectionConfigMock.mockReturnValue({
            ...connectionConfig,
            showConnectionModal: showConnectionModalMock,
        });
        render(<Component {...defaultProps} />);

        const button = screen
            .getByText("Add connection")
            .closest("button") as HTMLButtonElement;

        fireEvent.click(button);

        expect(showConnectionModalMock).toHaveBeenCalledWith(
            defaultProps.applicationId,
        );
    });

    it("should display Latest inputs section", () => {
        render(<Component {...defaultProps} />);
        expect(screen.getByText("Latest inputs")).toBeInTheDocument();
    });

    it("should display View inputs link when there are some inputs", () => {
        render(<Component {...defaultProps} />);
        const buttonLabel = screen.getByText("View inputs");
        expect(buttonLabel).toBeInTheDocument();

        const anchor = buttonLabel.closest("a") as HTMLAnchorElement;
        expect(anchor.getAttribute("href")).toBe(
            `/applications/${defaultProps.applicationId}/inputs`,
        );
    });

    it("should not display View inputs link when there are no inputs", () => {
        render(<Component {...defaultProps} />);
        useInputsConnectionQueryMock.mockReturnValue([
            {
                data: {
                    ...inputsConnectionMock,
                    inputsConnection: {
                        ...inputsConnectionMock.inputsConnection,
                        totalCount: 0,
                        edges: [],
                    },
                },
                fetching: false,
            },
        ] as any);
        expect(screen.getByText("View inputs")).toBeInTheDocument();
    });
});
