import { describe, expect, it } from "vitest";
import LabelWithTooltip from "../../src/components/LabelWithTooltip";
import { render, screen } from "../test-utils";

describe("LabelWithTooltip component", () => {
    it("should render the tooltip", async () => {
        render(
            <LabelWithTooltip
                label="Epoch"
                tooltipLabel="Current epoch index"
                tooltipProps={{ opened: true }}
            />,
        );

        expect(screen.getByText("Epoch")).toBeVisible();
        expect(screen.getByText("Current epoch index")).toBeVisible();
    });
});
