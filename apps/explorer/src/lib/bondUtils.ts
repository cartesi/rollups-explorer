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
