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
        expect(screen.getByRole("img").getAttribute("class")).toEqual(
            "anticon ant-web3-icon-ethereum-circle-colorful",
        );
    });

    it("Should display the ethereum network icon when chain set is Sepolia", () => {
        useConfigMock.mockReturnValue({
            chains: [sepolia],
        });

        render(<Component />);

        expect(screen.getByText("Sepolia")).toBeInTheDocument();
        expect(screen.getByRole("img").getAttribute("class")).toEqual(
            "anticon ant-web3-icon-ethereum-circle-colorful",
        );
    });

    it("Should display the Optimism network icon when chain set is Optimism Mainnet", () => {
        useConfigMock.mockReturnValue({
            chains: [optimism],
        });

        render(<Component />);

        expect(screen.getByText("OP Mainnet")).toBeInTheDocument();
        expect(screen.getByRole("img").getAttribute("class")).toEqual(
            "anticon ant-web3-icon-optimism-circle-colorful",
        );
    });

    it("Should display the Optimism network icon when chain set is Optimism Sepolia", () => {
        useConfigMock.mockReturnValue({
            chains: [optimismSepolia],
        });

        render(<Component />);

        expect(screen.getByText("OP Sepolia")).toBeInTheDocument();
        expect(screen.getByRole("img").getAttribute("class")).toEqual(
            "anticon ant-web3-icon-optimism-circle-colorful",
        );
    });

    it("Should display the Optimism network icon when chain set is Optimism Sepolia", () => {
        useConfigMock.mockReturnValue({
            chains: [anvil],
        });

        render(<Component />);

        expect(screen.getByText("Anvil")).toBeInTheDocument();
        expect(screen.getByRole("img").getAttribute("class")).toEqual(
            "anticon ant-web3-icon-hardhat-colorful",
        );
    });

    it("should list the networks cartesiscan supports as links to the live sites", async () => {
        const { container } = render(<Component />);

        expect(screen.queryByRole("menu")).not.toBeInTheDocument();

        fireEvent.click(screen.getByText("Ethereum"));

        await waitFor(() =>
            expect(screen.getByText("OP Sepolia")).toBeVisible(),
        );

        const menuEl = screen.getByRole("menu");
        const menuItems = getAllByRole(menuEl, "menuitem");

        expect(getByText(menuEl, "Mainnets")).toBeVisible();
        expect(getByText(menuEl, "Testnets")).toBeVisible();
        expect(menuItems).toHaveLength(6);

        [
            ["Ethereum", "https://cartesiscan.io"],
            ["Sepolia", "https://sepolia.cartesiscan.io"],
            ["Base", "https://base.cartesiscan.io"],
            ["OP Mainnet", "https://optimism.cartesiscan.io"],
            ["OP Sepolia", "https://optimism-sepolia.cartesiscan.io"],
            ["Base Sepolia", "https://base-sepolia.cartesiscan.io"],
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
