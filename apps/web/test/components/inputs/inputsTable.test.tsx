import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it } from "vitest";
import InputsTable, {
    InputsTableProps,
} from "../../../src/components/inputs/inputsTable";
import { withMantineTheme } from "../../utils/WithMantineTheme";

const Component = withMantineTheme(InputsTable);

const defaultProps: InputsTableProps = {
    inputs: [
        {
            id: "0xdb84080e7d2b4654a7e384de851a6cf7281643de-1",
            application: {
                id: "0xdb84080e7d2b4654a7e384de851a6cf7281643de",
            },
            index: 1,
            payload: "0x68656c6c6f2032",
            msgSender: "0x8a12cf75000cd2e73ab16469826838d5f137f444",
            timestamp: 1700593992,
            transactionHash:
                "0x4ad73b8f46dc16bc27d75b3f8f584e8785a8cb6fdf97a6c2a5a5dcfbda3e75c0",
            erc20Deposit: null,
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
});
