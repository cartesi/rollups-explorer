import { describe, expect, it } from "vitest";
import {
    formatBondValue,
    getBondAccounts,
    getBondTotals,
    isBondRecovery,
    isBondRefund,
} from "../../src/lib/bondUtils";
import { createBondEvent } from "../../src/stories/prt";

const recipient = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

const refund = (value: bigint, success: boolean) =>
    createBondEvent({ refund: { recipient, value, success } });

const recovery = createBondEvent({
    type: "BOND_RECOVERED",
    refund: null,
    recovery: {
        commitment:
            "0x725e9d3febbdd79841345f187aacf343ee497214277f3cb330aca90319cbdd92",
        claimer: recipient,
        payment: 30n,
        burned: 5n,
    },
});

describe("bondUtils", () => {
    it("should narrow bond events by type", () => {
        expect(isBondRefund(refund(1n, true))).toBe(true);
        expect(isBondRecovery(recovery)).toBe(true);
        expect(isBondRefund(recovery)).toBe(false);
    });

    it("should keep failed refunds out of the refunded total", () => {
        const totals = getBondTotals([
            refund(10n, true),
            refund(4n, false),
            refund(6n, true),
            refund(2n, false),
            recovery,
        ]);

        expect(totals).toEqual({
            refunded: 16n,
            failedRefunds: 6n,
            failedRefundCount: 2,
            paid: 30n,
            burned: 5n,
        });
    });

    it("should format wei values as ether", () => {
        expect(formatBondValue(1_500_000_000_000_000_000n)).toBe("1.5 ETH");
    });

    it("should group bond movements by the receiving account", () => {
        const other = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
        const accounts = getBondAccounts([
            refund(10n, true),
            createBondEvent({
                refund: { recipient: other, value: 3n, success: false },
            }),
            recovery,
        ]);

        expect(accounts).toEqual([
            {
                account: recipient,
                events: 2,
                refunded: 10n,
                failedRefunds: 0n,
                failedRefundCount: 0,
                paid: 30n,
                burned: 5n,
            },
            {
                account: other,
                events: 1,
                refunded: 0n,
                failedRefunds: 3n,
                failedRefundCount: 1,
                paid: 0n,
                burned: 0n,
            },
        ]);
    });
});
