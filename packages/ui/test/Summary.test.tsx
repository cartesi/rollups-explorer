import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Summary } from "../src";
import withMantineTheme from "./utils/WithMantineTheme";

const SummaryE = withMantineTheme(Summary);

describe("Rollups Summary", () => {
    it("should display totals for inputs and applications including icons", () => {
        render(<SummaryE applications={10} inputs={2} />);

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
});
