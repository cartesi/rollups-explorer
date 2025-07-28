import { describe, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { withMantineTheme } from "../utils/WithMantineTheme";
import userEvent from "@testing-library/user-event";
import CopyButton from "../../src/components/copyButton";

const Component = withMantineTheme(CopyButton);
const address = "0x60a7048c3136293071605a4eaffef49923e981cd";

describe("CopyButton", () => {
    it("should display copy tooltip", async () => {
        render(<Component value={address} />);

        await userEvent.hover(screen.getByTestId("copy-icon"));
        await waitFor(() => expect(screen.getByText("Copy")).toBeVisible());
    });

    it("should display copied tooltip", async () => {
        render(<Component value={address} />);

        await userEvent.click(screen.getByTestId("copy-icon"));
        await waitFor(() => expect(screen.getByText("Copied")).toBeVisible());
    });
});
