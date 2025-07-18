import {
    cleanup,
    fireEvent,
    getAllByRole,
    getByText,
    render,
    screen,
    waitFor,
} from "@testing-library/react";
import {
    anvil,
    arbitrum,
    arbitrumSepolia,
    base,
    baseSepolia,
    cannon,
    mainnet,
    optimism,
    optimismSepolia,
    sepolia,
} from "viem/chains";
import { afterEach, beforeEach, describe, it } from "vitest";
import { useConfig } from "wagmi";
import { CartesiScanChains } from "../../../src/components/networks/cartesiScanNetworks";
import withMantineTheme from "../../utils/WithMantineTheme";

vi.mock("wagmi");
const useConfigMock = vi.mocked(useConfig, { partial: true });
const Component = withMantineTheme(CartesiScanChains);

describe("CartesiScanNetworks component", () => {
    beforeEach(() => {
        useConfigMock.mockReturnValue({
            chains: [mainnet],
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("Should display the ethereum network icon when chain set is Mainnet", () => {
        render(<Component />);

        expect(screen.getByText("Ethereum")).toBeInTheDocument();
        expect(screen.getByRole("img").getAttribute("alt")).toEqual(
            "The Ethereum icon",
        );
    });

    it("Should display the ethereum network icon when chain set is Sepolia", () => {
        useConfigMock.mockReturnValue({
            chains: [sepolia],
        });

        render(<Component />);

        expect(screen.getByText("Sepolia")).toBeInTheDocument();
        expect(screen.getByRole("img").getAttribute("alt")).toEqual(
            "The Ethereum icon",
        );
    });

    it("Should display the Optimism network icon when chain set is Optimism Mainnet", () => {
        useConfigMock.mockReturnValue({
            chains: [optimism],
        });

        render(<Component />);

        expect(screen.getByText("OP Mainnet")).toBeInTheDocument();
        expect(screen.getByRole("img").getAttribute("alt")).toEqual(
            "The Optimism icon",
        );
    });

    it("Should display the Optimism network icon when chain set is Optimism Sepolia", () => {
        useConfigMock.mockReturnValue({
            chains: [optimismSepolia],
        });

        render(<Component />);

        expect(screen.getByText("OP Sepolia")).toBeInTheDocument();
        expect(screen.getByRole("img").getAttribute("alt")).toEqual(
            "The Optimism icon",
        );
    });

    it("Should display the Hardhat icon when chain set is anvil", () => {
        useConfigMock.mockReturnValue({
            chains: [anvil],
        });

        render(<Component />);

        expect(screen.getByText("Anvil")).toBeInTheDocument();
        expect(screen.getByRole("img").getAttribute("alt")).toEqual(
            "The Hardhat icon",
        );
    });

    it("should display the Cannon icon when chain set is Cannon (13370)", () => {
        useConfigMock.mockReturnValue({
            chains: [cannon],
        });

        render(<Component />);

        expect(screen.getByText("Cannon")).toBeInTheDocument();
        expect(screen.getByRole("img").getAttribute("aria-label")).toEqual(
            "The Cannon icon",
        );
    });

    it("Should display the Base network icon when chain set is Base Mainnet", () => {
        useConfigMock.mockReturnValue({
            chains: [base],
        });

        render(<Component />);

        expect(screen.getByText("Base")).toBeInTheDocument();
        expect(screen.getByRole("img").getAttribute("alt")).toEqual(
            "The Base icon",
        );
    });

    it("Should display the Base network icon when chain set is Base Sepolia", () => {
        useConfigMock.mockReturnValue({
            chains: [baseSepolia],
        });

        render(<Component />);

        expect(screen.getByText("Base Sepolia")).toBeInTheDocument();
        expect(screen.getByRole("img").getAttribute("alt")).toEqual(
            "The Base icon",
        );
    });

    it("Should display the Arbitrum network icon when chain set is Arbitrum Mainnet", () => {
        useConfigMock.mockReturnValue({
            chains: [arbitrum],
        });

        render(<Component />);

        expect(screen.getByText("Arbitrum One")).toBeInTheDocument();
        expect(screen.getByRole("img").getAttribute("alt")).toEqual(
            "The Arbitrum icon",
        );
    });

    it("Should display the Arbitrum network icon when chain set is Arbitrum Sepolia", () => {
        useConfigMock.mockReturnValue({
            chains: [arbitrumSepolia],
        });

        render(<Component />);

        expect(screen.getByText("Arbitrum Sepolia")).toBeInTheDocument();
        expect(screen.getByRole("img").getAttribute("alt")).toEqual(
            "The Arbitrum icon",
        );
    });

    it("should list the networks cartesiscan supports as links to the live sites", async () => {
        render(<Component />);

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();

        fireEvent.click(screen.getByText("Ethereum"));

        await waitFor(() =>
            expect(screen.getByText("OP Sepolia")).toBeVisible(),
        );

        const menuEl = screen.getByRole("menu");
        const menuItems = getAllByRole(menuEl, "menuitem");

        expect(getByText(menuEl, "Mainnets")).toBeVisible();
        expect(getByText(menuEl, "Testnets")).toBeVisible();
        expect(menuItems).toHaveLength(8);

        [
            ["Ethereum", "https://cartesiscan.io"],
            ["Sepolia", "https://sepolia.cartesiscan.io"],
            ["Base", "https://base.cartesiscan.io"],
            ["OP Mainnet", "https://optimism.cartesiscan.io"],
            ["OP Sepolia", "https://optimism-sepolia.cartesiscan.io"],
            ["Base Sepolia", "https://base-sepolia.cartesiscan.io"],
            ["Arbitrum One", "https://arbitrum.cartesiscan.io"],
            ["Arbitrum Sepolia", "https://arbitrum-sepolia.cartesiscan.io"],
        ].forEach(([expectedName, expectedLink]) => {
            expect(
                getByText(menuEl, expectedName)
                    .closest("a")
                    ?.getAttribute("href"),
            ).toEqual(expectedLink);
        });
    });

    it("should keep the link disabled for matching system chain setup and display an indicator", async () => {
        render(<Component />);

        fireEvent.click(screen.getByText("Ethereum"));

        const menuEl = await screen.findByRole("menu");

        const link = getByText(menuEl, "Ethereum").closest("a");
        expect(link?.hasAttribute("disabled")).toEqual(true);
        expect(
            link?.querySelector(".mantine-Indicator-indicator"),
        ).toBeInTheDocument();
    });
});
