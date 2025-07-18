import { afterEach, beforeEach, describe, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { withMantineTheme } from "../utils/WithMantineTheme";
import TransactionHash from "../../src/components/transactionHash";
import { foundry, sepolia } from "viem/chains";
import { useConfig } from "wagmi";

vi.mock("wagmi");
const useConfigMock = vi.mocked(useConfig, { partial: true });

const Component = withMantineTheme(TransactionHash);
const transactionHash =
    "0x858d2189bb86b745ef9838d433f21ce70325255bb060ab95372f8d282a5303f4";

describe("TransactionHash", () => {
    beforeEach(() => {
        useConfigMock.mockReturnValue({
            chains: [sepolia],
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    it("should display copy button", async () => {
        render(<Component transactionHash={transactionHash} />);
        expect(screen.getByTestId("copy-icon")).toBeInTheDocument();
    });

    it("should render the transaction hash as a link", () => {
        render(<Component transactionHash={transactionHash} />);
        const link = screen.getByText("0x858d21...5303f4").closest("a");

        expect(screen.getByText("0x858d21...5303f4")).toBeInTheDocument();
        expect(link?.getAttribute("href")).toEqual(
            `https://sepolia.etherscan.io/tx/${transactionHash}`,
        );
    });

    it("should render the transaction hash as a text", () => {
        useConfigMock.mockReturnValue({
            chains: [foundry],
        });

        render(<Component transactionHash={transactionHash} />);
        const link = screen.queryByText("0x858d21...5303f4")?.closest("a");

        expect(screen.queryByText("0x858d21...5303f4")).toBeInTheDocument();
        expect(link).toBeNull();
    });
});
