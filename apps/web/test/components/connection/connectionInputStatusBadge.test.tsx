import { render, screen } from "@testing-library/react";
import { useQuery } from "urql";
import { beforeEach, describe, expect, it } from "vitest";
import ConnectionInputStatusBadge from "../../../src/components/connection/connectionInputStatusBadge";
import { RollupVersion } from "../../../src/graphql/explorer/types";
import { InputStatusDocument } from "../../../src/graphql/rollups/operations";
import { InputStatusDocument as InputStatusDocumentV2 } from "../../../src/graphql/rollups/v2/operations";
import { withMantineTheme } from "../../utils/WithMantineTheme";

vi.mock("urql");
const useQueryMock = vi.mocked(useQuery, true);

const Component = withMantineTheme(ConnectionInputStatusBadge);

const defaultProps = {
    graphqlUrl: "https://drawingcanvas.fly.dev/graphql",
    index: 0,
    application: {
        id: "0x00",
        rollupVersion: RollupVersion.V1,
        address: "0x01",
    },
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

    describe("Call correct query based on version", () => {
        it("should dispatch correct query-document for rollup v1 application", () => {
            useQueryMock.mockReturnValue([
                {
                    fetching: true,
                },
            ] as any);

            render(<Component {...defaultProps} />);
            expect(useQueryMock).toHaveBeenCalledTimes(2);

            const [expectedParam] =
                useQueryMock.mock.calls.find((callParams) =>
                    callParams.some(
                        (param) => param.query === InputStatusDocument,
                    ),
                ) ?? [];

            expect(expectedParam).toHaveProperty("pause", false);
            expect(expectedParam).toHaveProperty("variables", { index: 0 });
        });

        it("should dispatch correct query-document for rollup v2 application", () => {
            useQueryMock.mockReturnValue([
                {
                    fetching: true,
                },
            ] as any);

            const props = {
                ...defaultProps,
                application: {
                    ...defaultProps.application,
                    rollupVersion: RollupVersion.V2,
                },
            };

            render(<Component {...props} />);

            expect(useQueryMock).toHaveBeenCalledTimes(2);

            const [expectedParam] =
                useQueryMock.mock.calls.find((callParams) =>
                    callParams.some(
                        (param) => param.query === InputStatusDocumentV2,
                    ),
                ) ?? [];

            expect(expectedParam).toHaveProperty("variables", { id: "0" });
            expect(expectedParam).toHaveProperty("pause", false);
        });
    });
});
