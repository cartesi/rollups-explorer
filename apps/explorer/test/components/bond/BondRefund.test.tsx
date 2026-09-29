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
});
