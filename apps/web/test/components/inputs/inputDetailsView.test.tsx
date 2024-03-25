import * as RollupsWagmi from "@cartesi/rollups-wagmi";
import {
    cleanup,
    fireEvent,
    getByText,
    render,
    screen,
} from "@testing-library/react";
import { useQuery } from "urql";
import { Address } from "viem";
import { afterEach, beforeEach, describe, it } from "vitest";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import InputDetailsView from "../../../src/components/inputs/inputDetailsView";
import { useConnectionConfig } from "../../../src/providers/connectionConfig/hooks";
import withMantineTheme from "../../utils/WithMantineTheme";
import { useConnectionConfigReturnStub } from "../../utils/connectionHelpers";
import {
    inputDetailsSample,
    inputDetailsSampleForPaging,
    inputSample,
} from "../../utils/dataSamples";
import { queryMockImplBuilder } from "../../utils/useQueryMock";

vi.mock("../../../src/providers/connectionConfig/hooks");
vi.mock("urql");
vi.mock("@cartesi/rollups-wagmi", async () => {
    const actual = await vi.importActual<typeof RollupsWagmi>(
        "@cartesi/rollups-wagmi",
    );

    return {
        ...actual,
        useReadCartesiDAppWasVoucherExecuted: () => ({
            data: {},
        }),
        useWriteCartesiDAppExecuteVoucher: () => ({
            data: {},
        }),
        useSimulateCartesiDAppExecuteVoucher: () => ({
            data: {
                request: {},
            },
        }),
    };
});
vi.mock("wagmi");

const useConnectionConfigMock = vi.mocked(useConnectionConfig, true);
const useQueryMock = vi.mocked(useQuery, true);
const useAccountMock = vi.mocked(useAccount, true);
const useWaitForTransactionReceiptMock = vi.mocked(
    useWaitForTransactionReceipt,
    true,
);

const View = withMantineTheme(InputDetailsView);

describe("Input details view component", () => {
    beforeEach(() => {
        useQueryMock.mockImplementation(queryMockImplBuilder());
        useConnectionConfigReturnStub.listConnections.mockReturnValue([]);
        useConnectionConfigReturnStub.getConnection.mockReturnValue(undefined);
        useConnectionConfigReturnStub.hasConnection.mockReturnValue(false);
        useConnectionConfigMock.mockReturnValue(useConnectionConfigReturnStub);
        useAccountMock.mockReturnValue({
            isConnected: true,
        } as any);
        useWaitForTransactionReceiptMock.mockReturnValue({
            status: "idle",
            isLoading: false,
        } as any);
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should display default setup for input payload", () => {
        render(<View input={inputSample} />);

        expect(screen.getByText("Input")).toBeInTheDocument();
        expect(screen.getByText("Notices")).toBeInTheDocument();
        expect(screen.getByText("Reports")).toBeInTheDocument();
        expect(screen.getByText("Vouchers")).toBeInTheDocument();
        expect(screen.getByText("Raw")).toBeInTheDocument();
        expect(screen.getByText("As Text")).toBeInTheDocument();
        expect(screen.getByText("As JSON")).toBeInTheDocument();
        expect(
            screen.getByDisplayValue("0x6a6f696e47616d65"),
        ).toBeInTheDocument();
    });

    it("should try to parse the inputs payload As Text", () => {
        render(<View input={inputSample} />);

        fireEvent.click(screen.getByText("As Text"));

        expect(screen.getByDisplayValue("joinGame")).toBeInTheDocument();
    });

    it("should try to parse the inputs payload As JSON", () => {
        render(<View input={inputSample} />);

        fireEvent.click(screen.getByText("As JSON"));

        expect(screen.getByDisplayValue("joinGame")).toBeInTheDocument();
    });

    describe("Without connection", () => {
        it("should display a connect button", () => {
            render(<View input={inputSample} />);

            fireEvent.click(screen.getByText("Notices"));

            const noticesPanel = screen.getByTestId("panel-notices");
            expect(noticesPanel).toBeVisible();

            expect(getByText(noticesPanel, "Connect")).toBeInTheDocument();
        });

        it("should pass the application id when click connect from reports panel", () => {
            const { showConnectionModal } = useConnectionConfigReturnStub;

            render(<View input={inputSample} />);

            fireEvent.click(screen.getByText("Reports"));

            const reportsPanel = screen.getByTestId("panel-reports");

            fireEvent.click(getByText(reportsPanel, "Connect"));

            expect(showConnectionModal).toHaveBeenCalledWith(
                "0x721be000f6054b5e0e57aaab791015b53f0a18f4",
            );
        });

        it("should pass the application id when click connect from notices panel", () => {
            const { showConnectionModal } = useConnectionConfigReturnStub;

            render(<View input={inputSample} />);

            fireEvent.click(screen.getByText("Notices"));

            const panel = screen.getByTestId("panel-notices");

            fireEvent.click(getByText(panel, "Connect"));

            expect(showConnectionModal).toHaveBeenCalledWith(
                "0x721be000f6054b5e0e57aaab791015b53f0a18f4",
            );
        });

        it("should pass the application id when click connect from vouchers panel", () => {
            const { showConnectionModal } = useConnectionConfigReturnStub;

            render(<View input={inputSample} />);

            fireEvent.click(screen.getByText("Vouchers"));

            const panel = screen.getByTestId("panel-vouchers");

            fireEvent.click(getByText(panel, "Connect"));

            expect(showConnectionModal).toHaveBeenCalledWith(
                "0x721be000f6054b5e0e57aaab791015b53f0a18f4",
            );
        });
    });

    describe("With connection", () => {
        const connection = {
            address: inputSample.application.id as Address,
            url: "localhost:8080/graphql",
        };

        beforeEach(() => {
            const { getConnection, hasConnection } =
                useConnectionConfigReturnStub;
            getConnection.mockReturnValue(connection);
            hasConnection.mockReturnValue(true);

            useQueryMock.mockImplementation(
                queryMockImplBuilder({
                    inputDetails: { data: inputDetailsSample },
                }),
            );
        });

        it("should display reports output when available", () => {
            render(<View input={inputSample} />);

            fireEvent.click(screen.getByText("Reports"));

            expect(screen.getByDisplayValue("0x5168342b")).toBeVisible();

            const reportsPanel = screen.getByTestId("panel-reports");

            fireEvent.click(getByText(reportsPanel, "As Text"));

            expect(screen.getByDisplayValue("Qh4+")).toBeVisible();
        });

        it("should display loader overlay when fetching more content", () => {
            const { rerender } = render(<View input={inputSample} />);

            fireEvent.click(screen.getByText("Reports"));

            useQueryMock.mockImplementation(
                queryMockImplBuilder({
                    inputDetails: {
                        data: inputDetailsSample,
                        fetching: true,
                    },
                }),
            );

            rerender(<View input={inputSample} />);

            expect(
                screen.getByTestId("loading-overlay-reportcontent"),
            ).toBeVisible();
        });

        it("should display how many entries is available for that input when available", () => {
            useQueryMock.mockImplementation(
                queryMockImplBuilder({
                    inputDetails: {
                        data: inputDetailsSampleForPaging,
                    },
                }),
            );

            render(<View input={inputSample} />);

            const reportsPanel = screen.getByTestId("panel-reports");
            const noticesPanel = screen.getByTestId("panel-notices");
            const vouchersPanel = screen.getByTestId("panel-vouchers");

            fireEvent.click(screen.getByText("Reports"));

            expect(getByText(reportsPanel, "1 of 4")).toBeVisible();
            expect(getByText(reportsPanel, "Next content")).toBeInTheDocument();
            expect(
                getByText(reportsPanel, "Previous content"),
            ).toBeInTheDocument();

            fireEvent.click(screen.getByText("Notices"));

            expect(getByText(noticesPanel, "1 of 2")).toBeVisible();
            expect(getByText(noticesPanel, "Next content")).toBeInTheDocument();
            expect(
                getByText(noticesPanel, "Previous content"),
            ).toBeInTheDocument();

            fireEvent.click(screen.getByText("Vouchers"));

            expect(getByText(vouchersPanel, "1 of 3")).toBeVisible();
            expect(
                getByText(vouchersPanel, "Next content"),
            ).toBeInTheDocument();
            expect(
                getByText(vouchersPanel, "Previous content"),
            ).toBeInTheDocument();
        });

        it("should be able through report paged entries", () => {
            const reExecQuery = vi.fn();
            useQueryMock.mockImplementation(
                queryMockImplBuilder({
                    inputDetails: {
                        data: inputDetailsSampleForPaging,
                    },
                    execQuery: reExecQuery,
                }),
            );

            render(<View input={inputSample} />);

            expect(reExecQuery).toHaveBeenCalledTimes(1);

            const reportsPanel = screen.getByTestId("panel-reports");

            fireEvent.click(screen.getByText("Reports"));

            fireEvent.click(getByText(reportsPanel, "Next content"));

            expect(reExecQuery).toHaveBeenCalledTimes(2);

            fireEvent.click(getByText(reportsPanel, "Previous content"));

            expect(reExecQuery).toHaveBeenCalledTimes(3);
        });

        it("should be able through notice paged entries", () => {
            const reExecQuery = vi.fn();
            useQueryMock.mockImplementation(
                queryMockImplBuilder({
                    inputDetails: {
                        data: inputDetailsSampleForPaging,
                    },
                    execQuery: reExecQuery,
                }),
            );

            render(<View input={inputSample} />);

            expect(reExecQuery).toHaveBeenCalledTimes(1);

            const panel = screen.getByTestId("panel-notices");

            fireEvent.click(screen.getByText("Notices"));

            fireEvent.click(getByText(panel, "Next content"));

            expect(reExecQuery).toHaveBeenCalledTimes(2);

            fireEvent.click(getByText(panel, "Previous content"));

            expect(reExecQuery).toHaveBeenCalledTimes(3);
        });

        it("should be able through vouchers paged entries", () => {
            const reExecQuery = vi.fn();
            useQueryMock.mockImplementation(
                queryMockImplBuilder({
                    inputDetails: {
                        data: inputDetailsSampleForPaging,
                    },
                    execQuery: reExecQuery,
                }),
            );

            render(<View input={inputSample} />);

            expect(reExecQuery).toHaveBeenCalledTimes(1);

            const panel = screen.getByTestId("panel-vouchers");

            fireEvent.click(screen.getByText("Vouchers"));

            fireEvent.click(getByText(panel, "Next content"));

            expect(reExecQuery).toHaveBeenCalledTimes(2);

            fireEvent.click(getByText(panel, "Previous content"));

            expect(reExecQuery).toHaveBeenCalledTimes(3);
        });
    });
});
