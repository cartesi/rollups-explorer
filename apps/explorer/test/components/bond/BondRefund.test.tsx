import { keccak256, toHex } from "viem";
import { describe, expect, it } from "vitest";
import { BondRefund } from "../../../src/components/bond/BondRefund";
import type { PartialBondRefundEvent } from "../../../src/lib/bondUtils";
import { createBondEvent } from "../../../src/stories/prt";
import { render, screen } from "../../test-utils";

const refund = (success: boolean) =>
    createBondEvent({
        refund: {
            recipient: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            value: 1_000_000_000_000_000n,
            success,
        },
    }) as PartialBondRefundEvent;

describe("BondRefund", () => {
    it("should show a paid refund", () => {
        render(<BondRefund refund={refund(true)} />);

        expect(
            screen.getByText("gas refunded 0.001 ETH to"),
        ).toBeInTheDocument();
        expect(screen.queryByText("not paid")).not.toBeInTheDocument();
    });

    it("should explain where the gas refund comes from", () => {
        render(<BondRefund refund={refund(true)} />);

        expect(
            screen.getByLabelText(/Paid from the tournament's pooled bonds/),
        ).toBeInTheDocument();
    });

    it("should show a failed refund as requested and not paid", () => {
        render(<BondRefund refund={refund(false)} />);

        expect(
            screen.getByText("gas refund requested 0.001 ETH to"),
        ).toBeInTheDocument();
        expect(screen.getByText("not paid")).toBeInTheDocument();
    });

    it("should label a refund sent by a depositor", () => {
        render(
            <BondRefund
                refund={refund(true)}
                depositors={[
                    {
                        commitment: keccak256(toHex("claim")),
                        depositor: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                    },
                ]}
            />,
        );

        expect(screen.getByText("depositor")).toBeInTheDocument();
        expect(screen.queryByText("other account")).not.toBeInTheDocument();
    });

    it("should label a refund sent by another account", () => {
        render(
            <BondRefund
                refund={refund(true)}
                depositors={[
                    {
                        commitment: keccak256(toHex("claim")),
                        depositor: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                    },
                ]}
            />,
        );

        expect(screen.getByText("other account")).toBeInTheDocument();
        expect(
            screen.getByLabelText(/didn't deposit either bond/),
        ).toBeInTheDocument();
    });

    it("should not label the sender without depositors", () => {
        render(<BondRefund refund={refund(true)} />);

        expect(screen.queryByText("depositor")).not.toBeInTheDocument();
        expect(screen.queryByText("other account")).not.toBeInTheDocument();
    });
});
