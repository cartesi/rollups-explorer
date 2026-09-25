import type { BondEvent } from "@cartesi/client";
import { formatEther } from "viem";

export type PartialBondRefundEvent = Extract<
    BondEvent,
    { type: "PARTIAL_BOND_REFUND" }
>;

export type BondRecoveredEvent = Extract<BondEvent, { type: "BOND_RECOVERED" }>;

export const isBondRefund = (
    event: BondEvent,
): event is PartialBondRefundEvent => event.type === "PARTIAL_BOND_REFUND";

export const isBondRecovery = (event: BondEvent): event is BondRecoveredEvent =>
    event.type === "BOND_RECOVERED";

export const formatBondValue = (value: bigint) => `${formatEther(value)} ETH`;

export type BondTotals = {
    refunded: bigint;
    failedRefunds: bigint;
    failedRefundCount: number;
    paid: bigint;
    burned: bigint;
};

/**
 * Sum the bond movements of the events. Failed refunds are kept apart, as
 * they record the requested value and not a payment.
 */
export const getBondTotals = (events: BondEvent[]): BondTotals =>
    events.reduce<BondTotals>(
        (totals, event) => {
            if (isBondRecovery(event)) {
                totals.paid += event.recovery.payment;
                totals.burned += event.recovery.burned;
            } else if (event.refund.success) {
                totals.refunded += event.refund.value;
            } else {
                totals.failedRefunds += event.refund.value;
                totals.failedRefundCount++;
            }
            return totals;
        },
        {
            refunded: 0n,
            failedRefunds: 0n,
            failedRefundCount: 0,
            paid: 0n,
            burned: 0n,
        },
    );
