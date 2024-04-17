import { cleanup, render, screen } from "@testing-library/react";
import { foundry, sepolia } from "viem/chains";
import { afterEach, beforeEach, describe, it } from "vitest";
import { useConfig } from "wagmi";
import { BlockExplorerLink } from "../../src/components/BlockExplorerLink";
import withMantineTheme from "../utils/WithMantineTheme";

vi.mock("wagmi");
const useConfigMock = vi.mocked(useConfig, { partial: true });
const Component = withMantineTheme(BlockExplorerLink);
const txHash =
    "0x4d6ce102c5aedd46aff879dbb42eef3465a2b7aa7fb39e64296194fb313efebf";
const address = "0xedB53860A6B52bbb7561Ad596416ee9965B055Aa";
const blockNumber = 5298115;

describe("BlockExplorerLink component", () => {
    beforeEach(() => {
        useConfigMock.mockReturnValue({
            chains: [sepolia],
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("it should render nothing when the block-explorer URL is not available", () => {
        useConfigMock.mockReturnValue({
            chains: [foundry],
        });

        render(<Component type="tx" value={txHash} />);
        const link = screen.queryByText("0x4d6ce1...3efebf")?.closest("a");

        expect(screen.queryByText("0x4d6ce1...3efebf")).not.toBeInTheDocument();
        expect(link).not.toBeDefined();
    });

    it("it should render the correct link to the block-explorer given a transaction hash", () => {
        render(<Component type="tx" value={txHash} />);
        const link = screen.getByText("0x4d6ce1...3efebf").closest("a");

        expect(screen.getByText("0x4d6ce1...3efebf")).toBeInTheDocument();
        expect(link?.getAttribute("href")).toEqual(
            `https://sepolia.etherscan.io/tx/${txHash}`,
        );
    });

    it("it should render the correct link to the block-explorer given an address", () => {
        render(<Component type="address" value={address} />);
        const textEl = screen.getByText("0xedB538...B055Aa");
        const link = textEl.closest("a");

        expect(textEl).toBeInTheDocument();
        expect(link?.getAttribute("href")).toEqual(
            `https://sepolia.etherscan.io/address/0xedB53860A6B52bbb7561Ad596416ee9965B055Aa`,
        );
    });

    it("it should render the correct link to the block-explorer given an block-number", () => {
        render(<Component type="block" value={blockNumber.toString()} />);
        const textEl = screen.getByText("5298115");
        const link = textEl.closest("a");

        expect(textEl).toBeInTheDocument();
        expect(link?.getAttribute("href")).toEqual(
            `https://sepolia.etherscan.io/block/5298115`,
        );
    });
});
