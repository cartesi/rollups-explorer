import { render, screen } from "@testing-library/react";
import { describe, it } from "vitest";
import { isObject } from "@vitest/utils";
import { ApplicationAutocomplete, TokenAutocomplete } from "../src";
import withMantineTheme from "./utils/WithMantineTheme";

const ApplicationAutoCompleteComponent = withMantineTheme(
    ApplicationAutocomplete,
);

const TokenAutoCompleteComponent = withMantineTheme(TokenAutocomplete);

const applications = [
    "0x60a7048c3136293071605a4eaffef49923e981cc",
    "0x70ac08179605af2d9e75782b8decdd3c22aa4d0c",
    "0x71ab24ee3ddb97dc01a161edf64c8d51102b0cd3",
];

const tokens = [
    "SIM20 - SimpleERC20 - 0x059c7507b973d1512768c06f32a813bc93d83eb2",
    "SIM20 - SimpleERC20 - 0x13bf42f9fed0d0d2708fbfdb18e80469d664fc14",
    "SIM20 - SimpleERC20 - 0xa46e0a31a1c248160acba9dd354c72e52c92c9f2",
];

const defaultApplicationProps = {
    applications,
    application: applications[0],
    onChange: () => undefined,
};

const defaultTokenProps = {
    tokens,
    erc20Address: tokens[0],
    error: "",
    isLoading: false,
    onChange: () => undefined,
};

describe("Rollups ERC20DepositForm", () => {
    describe("ApplicationAutocomplete", () => {
        it("should display correct label", () => {
            render(
                <ApplicationAutoCompleteComponent
                    {...defaultApplicationProps}
                />,
            );

            expect(screen.getByText("Application")).toBeInTheDocument();
        });

        it("should display correct description", () => {
            render(
                <ApplicationAutoCompleteComponent
                    {...defaultApplicationProps}
                />,
            );

            expect(
                screen.getByText("The application smart contract address"),
            ).toBeInTheDocument();
        });

        it("should display correct placeholder", () => {
            const { container } = render(
                <ApplicationAutoCompleteComponent
                    {...defaultApplicationProps}
                />,
            );
            const input = container.querySelector("input");

            expect(input?.getAttribute("placeholder")).toBe("0x");
        });

        it("should display alert for unemployed application", () => {
            render(
                <ApplicationAutoCompleteComponent
                    {...defaultApplicationProps}
                    application="undeployed-application"
                />,
            );

            expect(
                screen.getByText(
                    "This is a deposit to an undeployed application.",
                ),
            ).toBeInTheDocument();
        });

        it("should should set input value to selected application", () => {
            const selectedApplication = applications[1];
            const { container } = render(
                <ApplicationAutoCompleteComponent
                    {...defaultApplicationProps}
                    application={selectedApplication}
                />,
            );
            const input = container.querySelector("input");

            expect(input?.getAttribute("value")).toBe(selectedApplication);
        });
    });

    describe("TokenAutocomplete", () => {
        it("should display correct label", () => {
            render(<TokenAutoCompleteComponent {...defaultTokenProps} />);

            expect(screen.getByText("ERC-20")).toBeInTheDocument();
        });

        it("should display correct description", () => {
            render(<TokenAutoCompleteComponent {...defaultTokenProps} />);

            expect(
                screen.getByText("The ERC-20 smart contract address"),
            ).toBeInTheDocument();
        });

        it("should display correct placeholder", () => {
            const { container } = render(
                <TokenAutoCompleteComponent {...defaultTokenProps} />,
            );
            const input = container.querySelector("input");

            expect(input?.getAttribute("placeholder")).toBe("0x");
        });

        it("should display alert for first deposit of the selected token", () => {
            render(
                <TokenAutoCompleteComponent
                    {...defaultTokenProps}
                    erc20Address="undeployed-address"
                />,
            );

            expect(
                screen.getByText("This is the first deposit of that token."),
            ).toBeInTheDocument();
        });

        it("should should set input value to selected application", () => {
            const selectedToken = tokens[1].substring(tokens[1].indexOf("0x"));
            const { container } = render(
                <TokenAutoCompleteComponent
                    {...defaultTokenProps}
                    erc20Address={selectedToken}
                />,
            );
            const input = container.querySelector("input");

            expect(input?.getAttribute("value")).toBe(selectedToken);
        });

        it("should display error", () => {
            const error = "Some error";
            render(
                <TokenAutoCompleteComponent
                    {...defaultTokenProps}
                    error={error}
                />,
            );

            expect(screen.getByText(error)).toBeInTheDocument();
        });

        it("should display spinner while loading", () => {
            const { container } = render(
                <TokenAutoCompleteComponent {...defaultTokenProps} isLoading />,
            );
            const rightSlot = container.querySelector(
                '[data-position="right"]',
            );

            expect(isObject(rightSlot)).toBe(true);
        });
    });
});
