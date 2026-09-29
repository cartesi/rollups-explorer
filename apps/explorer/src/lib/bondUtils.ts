import type { BondEvent, Commitment, Tournament } from "@cartesi/client";
import { iTournamentAbi } from "@cartesi/client/abi";
import { groupBy } from "ramda";
import {
    decodeFunctionData,
    formatEther,
    getAddress,
    isAddressEqual,
    type Address,
    type Hash,
    type Transaction,
} from "viem";

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

export type BondAccount = BondTotals & { account: Address; events: number };

/**
 * Group the bond movements by the account that received them: the refund
 * recipient or the recovering claimer.
 */
export const getBondAccounts = (events: BondEvent[]): BondAccount[] => {
    const byAccount = groupBy(
        (event: BondEvent) =>
            getAddress(
                isBondRecovery(event)
                    ? event.recovery.claimer
                    : event.refund.recipient,
            ),
        events,
    );
    return Object.entries(byAccount).map(([account, accountEvents = []]) => ({
        account: account as Address,
        events: accountEvents.length,
        ...getBondTotals(accountEvents),
    }));
};

export type JoinBond = {
    commitment: Hash;
    depositor: Address;
    txHash: Hash;
    value: bigint;
    exact: boolean;
};

export type Depositor = Pick<JoinBond, "commitment" | "depositor">;

const isDirectJoin = (
    tournament: Address,
    transaction: Pick<Transaction, "to" | "input">,
) => {
    if (!transaction.to || !isAddressEqual(transaction.to, tournament)) {
        return false;
    }
    try {
        return (
            decodeFunctionData({ abi: iTournamentAbi, data: transaction.input })
                .functionName === "joinTournament"
        );
    } catch {
        return false;
    }
};

/**
 * The bond a commitment posted on join. A direct `joinTournament` call carries
 * the exact amount; a join sent through another contract only guarantees the
 * tournament bond value.
 * @returns the bond, or `undefined` while neither amount is known.
 */
export const toJoinBond = (
    tournament: Pick<Tournament, "address">,
    commitment: Pick<Commitment, "commitment" | "submitterAddress" | "txHash">,
    transaction?: Pick<Transaction, "to" | "input" | "value">,
    bondValue?: bigint,
): JoinBond | undefined => {
    const exact =
        transaction !== undefined &&
        isDirectJoin(tournament.address, transaction);
    const value = exact ? transaction.value : bondValue;
    if (value === undefined) return undefined;
    return {
        commitment: commitment.commitment,
        depositor: commitment.submitterAddress,
        txHash: commitment.txHash,
        value,
        exact,
    };
};
