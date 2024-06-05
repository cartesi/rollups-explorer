import { describe, it, beforeEach, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { useQuery } from "urql";
import ConnectionInputStatusBadge from "../../../src/components/connection/connectionInputStatusBadge";
import { withMantineTheme } from "../../utils/WithMantineTheme";

vi.mock("urql");
const useQueryMock = vi.mocked(useQuery, true);

const Component = withMantineTheme(ConnectionInputStatusBadge);

const defaultProps = {
    graphqlUrl: "https://drawingcanvas.fly.dev/graphql",
    index: 0,
};

const defaultData = {
    input: {
        status: "ACTIVE",
    },
};

describe("ConnectionInputStatusBadge component", () => {
    beforeEach(() => {
        useQueryMock.mockReturnValue([
            {
                fetching: false,
                data: defaultData,
            },
        ] as any);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("should display loading UI while fetching data", () => {
        useQueryMock.mockReturnValue([
            {
                fetching: true,
            },
        ] as any);
        render(<Component {...defaultProps} />);

        expect(
            screen.getByTestId("connection-input-status-loader"),
        ).toBeInTheDocument();
    });

    it("should display correct status", () => {
        render(<Component {...defaultProps} />);
        expect(screen.getByText(defaultData.input.status)).toBeInTheDocument();
    });

    it("should display not available label when status is unavailable", () => {
        useQueryMock.mockReturnValue([
            {
                fetching: false,
                data: {
                    input: {
                        status: undefined,
                    },
                },
            },
        ] as any);
        render(<Component {...defaultProps} />);
        expect(screen.getByText("N/A")).toBeInTheDocument();
    });
});
