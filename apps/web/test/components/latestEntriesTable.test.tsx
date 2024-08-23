import { fireEvent, render, screen } from "@testing-library/react";
import prettyMilliseconds from "pretty-ms";
import { getAddress } from "viem";
import { describe, it } from "vitest";
import LatestEntriesTable, {
    LatestEntriesTableProps,
} from "../../src/components/latestEntriesTable";
import { withMantineTheme } from "../utils/WithMantineTheme";

const Component = withMantineTheme(LatestEntriesTable);

const defaultProps: LatestEntriesTableProps = {
    entries: [
        {
            appAddress: "0x0974cc873df893b302f6be7ecf4f9d4b1a15c366",
            appId: "11155111-0x0974cc873df893b302f6be7ecf4f9d4b1a15c366",
            timestamp: 1700593992,
            href: "/inputs/0xdb84080e7d2b4654a7e384de851a6cf7281643de",
        },
    ],
    fetching: false,
    totalCount: 1,
};

describe("LatestEntriesTable component", () => {
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

    it("should display correct label when no entries are fetched", () => {
        render(<Component entries={[]} fetching={false} totalCount={0} />);
        expect(screen.getByText("No entries")).toBeInTheDocument();
    });

    it("should display correct age", () => {
        render(<Component {...defaultProps} />);

        const [entry] = defaultProps.entries;
        const age = `${prettyMilliseconds(Date.now() - entry.timestamp * 1000, {
            unitCount: 2,
            secondsDecimalDigits: 0,
            verbose: true,
        })} ago`;
        expect(screen.getByText(age)).toBeInTheDocument();
    });

    it("should display correct timestamp in UTC format", () => {
        render(<Component {...defaultProps} />);

        const timeTypeButton = screen.getByText("Age");
        fireEvent.click(timeTypeButton);

        const [entry] = defaultProps.entries;
        const timestamp = new Date(entry.timestamp * 1000).toISOString();
        expect(screen.getByText(timestamp)).toBeInTheDocument();
    });

    it("should display shortened application address", () => {
        render(<Component {...defaultProps} />);
        const [entry] = defaultProps.entries;
        const appId = getAddress(entry.appAddress);
        const shortenedId = `${appId.slice(0, 8)}...${appId.slice(-6)}`;

        expect(screen.getByText(shortenedId)).toBeInTheDocument();
    });

    it("should wrap application address in a link", () => {
        render(<Component {...defaultProps} />);
        const [entry] = defaultProps.entries;
        const appId = getAddress(entry.appAddress);
        const shortenedId = `${appId.slice(0, 8)}...${appId.slice(-6)}`;

        const link = screen.getByText(shortenedId)
            .parentElement as HTMLAnchorElement;

        expect(link.getAttribute("href")).toBe(entry.href);
    });
});
