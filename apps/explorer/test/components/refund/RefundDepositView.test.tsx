import { keccak256, parseUnits, toHex } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useConfig } from "wagmi";
import { foundry } from "wagmi/chains";
import { RefundDepositView } from "../../../src/components/refund/RefundDepositView";
import type { RefundAsset } from "../../../src/components/refund/lib/refundUtils";
import { depositor, token } from "../../../src/stories/deposits";
import { fireEvent, render, screen } from "../../test-utils";

vi.mock("wagmi", async () => {
    const actual = await vi.importActual("wagmi");
    return { ...actual, useConfig: vi.fn() };
});

const useConfigMock = vi.mocked(useConfig, { partial: true });

const ether: RefundAsset = {
    kind: "ether",
    depositor,
    value: parseUnits("1.5", 18),
};

describe("RefundDepositView", () => {
    beforeEach(() => {
        useConfigMock.mockReturnValue({ chains: [foundry] });
    });

    it("should describe what is refunded to whom", () => {
        render(<RefundDepositView status="refundable" asset={ether} />);

        expect(screen.getByText("Refund 1.5 ETH to")).toBeInTheDocument();
        expect(screen.getByText("0xf39Fd6...b92266")).toBeInTheDocument();
        expect(
            screen.getByLabelText(/Anyone can issue a refund/),
        ).toBeInTheDocument();
    });

    it("should send the refund from the button", () => {
        const onRefund = vi.fn();
        render(
            <RefundDepositView
                status="refundable"
                asset={ether}
                onRefund={onRefund}
            />,
        );

        fireEvent.click(screen.getByRole("button", { name: "Refund deposit" }));

        expect(onRefund).toHaveBeenCalledOnce();
    });

    it("should wait for confirmation while refunding", () => {
        render(<RefundDepositView status="refunding" asset={ether} />);

        expect(
            screen.getByText("Waiting for confirmation…"),
        ).toBeInTheDocument();
        expect(screen.getByRole("button")).toHaveAttribute(
            "data-loading",
            "true",
        );
    });

    it("should show the refund transaction once refunded", () => {
        render(
            <RefundDepositView
                status="refunded"
                asset={ether}
                transactionHash={keccak256(toHex("refund"))}
            />,
        );

        expect(screen.getByText("Deposit refunded")).toBeInTheDocument();
        expect(screen.getByText(/^0x[0-9a-f]{6}\.\.\./)).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Refund deposit" }),
        ).not.toBeInTheDocument();
    });

    it("should show the error copy when the refund failed", () => {
        render(
            <RefundDepositView
                status="failed"
                asset={ether}
                errorMessage="A refund was already issued for this deposit."
            />,
        );

        expect(
            screen.getByText("A refund was already issued for this deposit."),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Refund deposit" }),
        ).toBeInTheDocument();
    });

    it("should report that the status is still being read", () => {
        render(<RefundDepositView status="unknown" asset={ether} />);

        expect(screen.getByText("Checking refund status…")).toBeInTheDocument();
    });

    it("should list every token id of an ERC-1155 batch", () => {
        render(
            <RefundDepositView
                status="refundable"
                asset={{
                    kind: "erc1155-batch",
                    depositor,
                    token,
                    symbol: "GAME",
                    items: [
                        { tokenId: 7n, value: 3n },
                        { tokenId: 9n, value: 1n },
                    ],
                }}
            />,
        );

        expect(
            screen.getByText("Refund 2 token ids of GAME to"),
        ).toBeInTheDocument();
        expect(screen.getByText("#7 × 3")).toBeInTheDocument();
        expect(screen.getByText("#9 × 1")).toBeInTheDocument();
    });
});
