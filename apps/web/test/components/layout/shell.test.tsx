import {
    fireEvent,
    getAllByRole,
    getByText,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import { mainnet } from "viem/chains";
import { afterAll, beforeEach, describe, it } from "vitest";
import { useAccount, useConfig } from "wagmi";
import Shell from "../../../src/components/layout/shell";
import { useAppConfig } from "../../../src/providers/appConfigProvider";
import withMantineTheme from "../../utils/WithMantineTheme";

vi.mock("../../../src/providers/appConfigProvider");
const useAppConfigMock = vi.mocked(useAppConfig, { partial: true });

vi.mock("wagmi");
const useConfigMock = vi.mocked(useConfig, { partial: true });
const useAccountMock = vi.mocked(useAccount, { partial: true });

const Component = withMantineTheme(Shell);

describe("Shell component", () => {
    beforeEach(() => {
        useConfigMock.mockReturnValue({
            chains: [mainnet],
        });

        useAccountMock.mockReturnValue({
            address: "0x8FD78976f8955D13bAA4fC99043208F4EC020D7E",
        });

        useAppConfigMock.mockReturnValue({ chainId: "31337" });
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    describe("Cartesi logo", () => {
        it("should be wrapped in a anchor element with href to index route", () => {
            const { container } = render(<Component>Children</Component>);
            const logo = container.querySelector("svg") as SVGSVGElement;
            const logoLink = logo.closest("a") as HTMLAnchorElement;

            expect(logoLink.getAttribute("href")).toBe("/");
        });
    });

    describe("Header", () => {
        it("should display 'Send Transaction' button in header", () => {
            render(<Component>Children</Component>);

            expect(
                within(screen.getByTestId("header")).getByTestId(
                    "transaction-button",
                ),
            ).toBeInTheDocument();
        });

        it("should enable 'Send Transaction' button when network is correct", () => {
            useAccountMock.mockReturnValue({
                address: "0x8FD78976f8955D13bAA4fC99043208F4EC020D7E",
                isConnected: true,
                chainId: 31337,
            });

            render(<Component>Children</Component>);

            const button = within(screen.getByTestId("header")).getByTestId(
                "transaction-button",
            );
            expect(button.hasAttribute("disabled")).toBe(false);
        });

        it("should display disable 'Send Transaction' button when network is wrong", () => {
            useAccountMock.mockReturnValue({
                address: "0x8FD78976f8955D13bAA4fC99043208F4EC020D7E",
                isConnected: true,
                chainId: 31337,
            });
            useAppConfigMock.mockReturnValue({ chainId: "11155111" });
            render(<Component>Children</Component>);

            const button = within(screen.getByTestId("header")).getByTestId(
                "transaction-button",
            );
            expect(button.hasAttribute("disabled")).toBe(true);
        });

        it("should not display home and applications links in header", () => {
            render(<Component>Children</Component>);

            expect(() =>
                within(screen.getByTestId("header")).getByTestId("home-link"),
            ).toThrow("Unable to find an element");

            expect(() =>
                within(screen.getByTestId("header")).getByTestId(
                    "applications-link",
                ),
            ).toThrow("Unable to find an element");
        });

        it("should display the cartesiscan chain button", () => {
            render(<Component>Children</Component>);

            const headerEl = screen.getByTestId("header");

            expect(getByText(headerEl, "Ethereum")).toBeInTheDocument();
        });

        it("should display menu of supported chains after clicking the chain button", async () => {
            render(<Component>Children</Component>);

            fireEvent.click(screen.getByText("Ethereum"));

            const menuEl = await screen.findByRole("menu");

            expect(getAllByRole(menuEl, "menuitem")).toHaveLength(8);
            expect(getByText(menuEl, "Ethereum")).toBeInTheDocument();
            expect(getByText(menuEl, "Sepolia")).toBeInTheDocument();
            expect(getByText(menuEl, "OP Mainnet")).toBeInTheDocument();
            expect(getByText(menuEl, "OP Sepolia")).toBeInTheDocument();
            expect(getByText(menuEl, "Base")).toBeInTheDocument();
            expect(getByText(menuEl, "Base Sepolia")).toBeInTheDocument();
            expect(getByText(menuEl, "Arbitrum One")).toBeInTheDocument();
            expect(getByText(menuEl, "Arbitrum Sepolia")).toBeInTheDocument();
        });
    });

    describe("Navbar", () => {
        it("should display home and applications links in navbar", () => {
            render(<Component>Children</Component>);

            expect(
                within(screen.getByTestId("navbar")).getByTestId("home-link"),
            ).toBeInTheDocument();
            expect(
                within(screen.getByTestId("navbar")).getByTestId(
                    "applications-link",
                ),
            ).toBeInTheDocument();
        });

        it("should display navbar on desktop", () => {
            const { container } = render(<Component>Children</Component>);
            const navbar = container.querySelector(
                ".mantine-AppShell-navbar",
            ) as HTMLDivElement;

            expect(navbar).toBeVisible();
        });

        it("should display settings menu in navbar", () => {
            render(<Component>Children</Component>);

            expect(
                within(screen.getByTestId("navbar")).getByTestId(
                    "settings-link",
                ),
            ).toBeInTheDocument();
        });

        it("should display connections link in settings menu", async () => {
            render(<Component>Children</Component>);

            const settingsMenu = within(
                screen.getByTestId("navbar"),
            ).getByTestId("settings-link");

            fireEvent.click(settingsMenu);

            await waitFor(() =>
                expect(
                    screen.getByTestId("connections-link"),
                ).toBeInTheDocument(),
            );

            await waitFor(() =>
                expect(
                    screen.getByTestId("connections-link").getAttribute("href"),
                ).toBe("/connections"),
            );
        });
    });
});
