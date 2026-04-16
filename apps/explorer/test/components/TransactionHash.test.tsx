import { screen } from "@testing-library/react";

import { beforeEach, describe, expect, it, vi } from "vitest";
import { useConfig } from "wagmi";
import { foundry, mainnet } from "wagmi/chains";
import TransactionHash from "../../src/components/TransactionHash";
import { render } from "../test-utils";

vi.mock("wagmi", async () => {
    const actual = await vi.importActual("wagmi");
    return {
        ...actual,
        useConfig: vi.fn(),
    };
});

const useConfigMock = vi.mocked(useConfig, { partial: true });

describe("TransactionHash component", () => {
    const hash =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    beforeEach(() => {
        useConfigMock.mockReturnValue({ chains: [mainnet] });
    });

    it("should render a link to the chain explorer when available", () => {
        render(<TransactionHash transactionHash={hash} />);

        expect(screen.getByRole("link")).toHaveAttribute(
            "href",
            `https://etherscan.io/tx/${hash}`,
        );
    });

    it("should fallback to display only text when the chain explorer is unavailable", () => {
        useConfigMock.mockReturnValue({ chains: [foundry] });

        render(<TransactionHash transactionHash={hash} />);

        expect(screen.getByText("0x123456...abcdef")).toBeInTheDocument();
    });
});
