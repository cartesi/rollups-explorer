import { inputBoxAddress } from "@cartesi/wagmi";
import { describe, expect, it } from "vitest";
import Address from "../../src/components/Address";
import { render, screen } from "../test-utils";

describe("Address Component", () => {
    it("should render shortened address text", () => {
        render(
            <Address
                value="0x0000000000000000000000000000000000000001"
                shorten
                canCopy={false}
            />,
        );

        expect(screen.getByText("0x000000...000001")).toBeVisible();
    });

    it("should render resolved name when available", () => {
        render(<Address value={inputBoxAddress} canCopy={false} />);

        expect(screen.getByText("InputBox")).toBeVisible();
    });

    it("should render link when href is provided", () => {
        render(
            <Address
                value="0x0000000000000000000000000000000000000001"
                href="/apps"
                canCopy={false}
            />,
        );

        expect(screen.getByRole("link")).toHaveAttribute("href", "/apps");
    });
});
