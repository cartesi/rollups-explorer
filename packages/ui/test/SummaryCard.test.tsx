import { render, screen } from "@testing-library/react";
import { TbUser } from "react-icons/tb";
import { describe, expect, it } from "vitest";
import { SummaryCard } from "../src";
import withMantineTheme from "./utils/WithMantineTheme";

const SummaryCardE = withMantineTheme(SummaryCard);

describe("Rollups SummaryCard", () => {
    it("should display the title and number as configured", async () => {
        render(<SummaryCardE title="Applications" value={100} />);

        expect(screen.getByText("Applications")).toBeInTheDocument();
        expect(screen.queryByText("100")).toBeInTheDocument();
    });

    it("should display icon when defined", () => {
        const { container } = render(
            <SummaryCardE title="Applications" value={10} icon={TbUser} />
        );
        expect(
            screen.getByTestId("summary-card-applications-icon")
        ).toBeInTheDocument();
    });
});
