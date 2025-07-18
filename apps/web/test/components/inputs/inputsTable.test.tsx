import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useQuery } from "urql";
import { beforeEach, describe, it } from "vitest";
import InputsTable, {
    InputsTableProps,
} from "../../../src/components/inputs/inputsTable";
import { useConnectionConfig } from "../../../src/providers/connectionConfig/hooks";
import { withMantineTheme } from "../../utils/WithMantineTheme";
import { useConfig } from "wagmi";
import { sepolia } from "viem/chains";
import { RollupVersion } from "@cartesi/rollups-explorer-domain/explorer-types";

vi.mock("wagmi");
const useConfigMock = vi.mocked(useConfig, { partial: true });

vi.mock("../../../src/providers/connectionConfig/hooks");
const useConnectionConfigMock = vi.mocked(useConnectionConfig, true);

vi.mock("urql");
const useQueryMock = vi.mocked(useQuery, true);
const Component = withMantineTheme(InputsTable);
const defaultProps: InputsTableProps = {
    inputs: [
        {
            id: "11155111-0xdb84080e7d2b4654a7e384de851a6cf7281643de-1",
            application: {
                id: "11155111-0xdb84080e7d2b4654a7e384de851a6cf7281643de",
                address: "0xdb84080e7d2b4654a7e384de851a6cf7281643de",
                rollupVersion: "v1" as RollupVersion,
            },
            index: 1,
            payload: "0x68656c6c6f2032",
            msgSender: "0x8a12cf75000cd2e73ab16469826838d5f137f444",
            timestamp: 1700593992,
            transactionHash:
                "0x4ad73b8f46dc16bc27d75b3f8f584e8785a8cb6fdf97a6c2a5a5dcfbda3e75c0",
            erc20Deposit: null,
            chain: {
                id: "11155111",
            },
        },
    ],
    fetching: false,
    totalCount: 1,
};
const IntersectionObserverMock = vi.fn(() => ({
    disconnect: vi.fn(),
    observe: vi.fn(),
    takeRecords: vi.fn(),
    unobserve: vi.fn(),
}));

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
describe("InputsTable component", () => {
    beforeEach(() => {
        useConfigMock.mockReturnValue({
            chains: [sepolia],
        });

        useConnectionConfigMock.mockReturnValue({
            getConnection: () => vi.fn(),
            hasConnection: () => vi.fn(),
            showConnectionModal: () => vi.fn(),
            listConnections: () => [],
        } as any);

        useQueryMock.mockReturnValue([
            {
                fetching: false,
                data: {
                    input: {
                        status: "ACTIVE",
                    },
                },
            },
        ] as any);
    });

    it("should display time column with age label", () => {
        render(<Component {...defaultProps} />);
        expect(screen.getByText("Age")).toBeInTheDocument();
    });

    it("should display time column with timestamp label", () => {
        render(<Component {...defaultProps} />);

        const timeTypeButton = screen.getByText("Age");
        fireEvent.click(timeTypeButton);

        expect(screen.getByText("Timestamp (UTC)")).toBeInTheDocument();
    });

    it("should display spinner when fetching data", () => {
        render(<Component {...defaultProps} fetching />);
        expect(screen.getByTestId("inputs-table-spinner")).toBeInTheDocument();
    });

    it("should display correct label when no inputs are fetched", () => {
        render(<Component inputs={[]} fetching={false} totalCount={0} />);
        expect(screen.getByText("No inputs")).toBeInTheDocument();
    });

    it("should display correct status head column", async () => {
        render(<Component {...defaultProps} />);

        const statusCol = screen.getByText("Status");
        expect(statusCol).toBeInTheDocument();

        fireEvent.mouseEnter(statusCol.parentNode as HTMLDivElement);
        await waitFor(() =>
            expect(
                screen.getByText(
                    "Check the status by adding a connection. Click the ? in the row to add a connection.",
                ),
            ).toBeInTheDocument(),
        );
    });

    it("should hide status tooltip when there are some connections", async () => {
        useConnectionConfigMock.mockReturnValue({
            getConnection: () => vi.fn(),
            hasConnection: () => vi.fn(),
            showConnectionModal: () => vi.fn(),
            listConnections: () => [
                {
                    url: "https://drawingcanvas.fly.dev/graphql",
                    address: "0x60a7048c3136293071605a4eaffef49923e981cd",
                },
            ],
        } as any);
        render(<Component {...defaultProps} />);

        expect(() => screen.getByTestId("tooltip-icon")).toThrow(
            "Unable to find an element",
        );

        const statusCol = screen.getByText("Status");
        expect(statusCol).toBeInTheDocument();

        fireEvent.mouseEnter(statusCol.parentNode as HTMLDivElement);
        await waitFor(() =>
            expect(() =>
                screen.getByText(
                    "Check the status by adding a connection. Click the ? in the row to add a connection.",
                ),
            ).toThrow("Unable to find an element"),
        );
    });
});
