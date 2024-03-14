import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useAccount } from "wagmi";
import { Summary } from "../src";
import withMantineTheme from "./utils/WithMantineTheme";
const SummaryE = withMantineTheme(Summary);
vi.mock("wagmi");

const useAccountMock = vi.mocked(useAccount, true);
describe("Rollups Summary", () => {
    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });
    it("should display totals for inputs and applications including icons", () => {
        useAccountMock.mockReturnValue({
            isConnected: true,
        } as any);
        render(<SummaryE applications={10} inputs={2} applicationsOwned={7} />);

        expect(screen.getByText("Applications")).toBeInTheDocument();
        expect(
            screen.getByTestId("summary-card-applications-icon"),
        ).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("Inputs")).toBeInTheDocument();
        expect(
            screen.getByTestId("summary-card-inputs-icon"),
        ).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
    });
    it("should not display 'My Applications' card when wallet is not connected", () => {
        useAccountMock.mockReturnValue({
            isConnected: false,
        } as any);
        render(<SummaryE applications={10} inputs={2} applicationsOwned={7} />);
        const myApplications = screen.queryByText("My Applications");
        expect(myApplications).toBeNull();
    });
    it("should display 'My Applications' card when wallet is connected", () => {
        useAccountMock.mockReturnValue({
            isConnected: true,
        } as any);
        render(
            <SummaryE applications={10} inputs={2} applicationsOwned={17} />,
        );
        expect(screen.getByText("My Applications")).toBeInTheDocument();
        expect(screen.getByText("17")).toBeInTheDocument();
        expect(
            screen.getByTestId("summary-card-inputs-icon"),
        ).toBeInTheDocument();
    });
});
