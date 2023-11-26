import { describe, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { withMantineTheme } from "../utils/WithMantineTheme";
import Footer from "../../src/components/footer";

const Component = withMantineTheme(Footer);

describe("Footer component", () => {
    it("should display app description", () => {
        render(<Component />);

        expect(
            screen.getByText(
                "CartesiScan is a tool for inspecting and analyzing Cartesi rollups applications.Blockchain explorer for Ethereum Networks.",
            ),
        ).toBeInTheDocument();
    });

    it("should display app copyright", () => {
        render(<Component />);

        const appCopyright = screen.getByTestId("app-copyright");
        expect(appCopyright.textContent).toBe(
            "(c) Cartesi and individual authors (see AUTHORS)SPDX-License-Identifier: Apache-2.0 (see LICENSE)",
        );
    });

    it("should display authors link with correct href", () => {
        render(<Component />);

        const link = screen.getByText("AUTHORS");
        expect(link.getAttribute("href")).toBe(
            "https://github.com/cartesi/rollups-explorer/blob/main/AUTHORS",
        );
    });

    it("should display license link with correct href", () => {
        render(<Component />);

        const link = screen.getByText("LICENSE");
        expect(link.getAttribute("href")).toBe(
            "https://github.com/cartesi/rollups-explorer/blob/main/LICENSE",
        );
    });

    it("should display 'Report a bug' link with correct href", () => {
        render(<Component />);

        const link = screen.getByText("Report a bug");
        expect(link.getAttribute("href")).toBe(
            "https://github.com/cartesi/rollups-explorer/issues/new?assignees=&labels=Type%3A+Bug%2CStatus%3A+Needs+triage&projects=&template=2-bug.md&title=",
        );
    });

    it("should display 'Feature request' link with correct href", () => {
        render(<Component />);

        const link = screen.getByText("Feature request");
        expect(link.getAttribute("href")).toBe(
            "https://github.com/cartesi/rollups-explorer/issues/new?assignees=&labels=Type%3A+Feature%2CStatus%3A+Needs+triage&projects=&template=1-feature.md&title=",
        );
    });

    it("should display 'Contribute' link with correct href", () => {
        render(<Component />);

        const link = screen.getByText("Contribute");
        expect(link.getAttribute("href")).toBe(
            "https://github.com/cartesi/rollups-explorer/blob/main/CONTRIBUTING.md",
        );
    });

    it("should display 'Discord' link with correct href", () => {
        render(<Component />);

        const link = screen.getByText("Discord");
        expect(link.getAttribute("href")).toBe(
            "https://discord.com/invite/pfXMwXDDfW",
        );
    });

    it("should display 'Docs' link with correct href", () => {
        render(<Component />);

        const link = screen.getByText("Docs");
        expect(link.getAttribute("href")).toBe("https://docs.cartesi.io/");
    });
});
