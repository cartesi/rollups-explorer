import { iTournamentAbi } from "@cartesi/client/abi";
import { encodeFunctionData, keccak256, toHex, zeroHash } from "viem";
import { describe, expect, it } from "vitest";
import {
    formatBondValue,
    getBondAccounts,
    getBondPool,
    getBondTotals,
    isBondRecovery,
    isBondRefund,
    toJoinBond,
} from "../../src/lib/bondUtils";
import {
    createBondEvent,
    createCommitment,
    createJoinBond,
    createTournament,
} from "../../src/stories/prt";

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

describe("toJoinBond", () => {
    const tournament = createTournament();
    const commitment = createCommitment();
    const bondValue = 21_000_000_000_000_000n;
    const leftNode = keccak256(toHex("left"));
    const rightNode = keccak256(toHex("right"));
    const join = {
        to: tournament.address,
        input: encodeFunctionData({
            abi: iTournamentAbi,
            functionName: "joinTournament",
            args: [zeroHash, [], leftNode, rightNode],
        }),
        value: 25_000_000_000_000_000n,
    };

    it("should read the exact amount and root children from a direct join", () => {
        expect(toJoinBond(tournament, commitment, join, bondValue)).toEqual({
            commitment: commitment.commitment,
            depositor: commitment.submitterAddress,
            txHash: commitment.txHash,
            value: 25_000_000_000_000_000n,
            exact: true,
            children: [leftNode, rightNode],
        });
    });

    it("should use the bond value for a join sent through another contract", () => {
        const relayed = {
            ...join,
            to: "0x9c1e7a3c1d0b8f2e4a6b5c7d8e9f0a1b2c3d33d0",
        } as const;

        expect(toJoinBond(tournament, commitment, relayed, bondValue)).toEqual(
            expect.objectContaining({ value: bondValue, exact: false }),
        );
        expect(
            toJoinBond(tournament, commitment, relayed, bondValue)?.children,
        ).toBeUndefined();
    });

    it("should use the bond value for another call to the tournament", () => {
        expect(
            toJoinBond(
                tournament,
                commitment,
                { ...join, input: "0x1234" },
                bondValue,
            ),
        ).toMatchObject({ value: bondValue, exact: false });
    });

    it("should resolve nothing while no amount is known", () => {
        expect(toJoinBond(tournament, commitment)).toBeUndefined();
    });
});

describe("getBondPool", () => {
    const bond = createJoinBond(createCommitment());
    const events = [
        refund(1_000_000_000_000_000n, true),
        refund(2_000_000_000_000_000n, false),
        recovery,
    ];

    it("should sum the deposits, paid refunds and recovery", () => {
        const { refunded, paid, burned } = getBondTotals(events);

        expect(getBondPool([bond, bond], 2, events)).toEqual({
            deposited: 42_000_000_000_000_000n,
            exact: true,
            joins: 2,
            refunded,
            refunds: 1,
            paid,
            burned,
        });
    });

    it("should mark the deposits as a minimum when a join is relayed", () => {
        expect(
            getBondPool([bond, { ...bond, exact: false }], 2, []).exact,
        ).toBe(false);
    });

    it("should mark the deposits as a minimum while a bond is unknown", () => {
        expect(getBondPool([bond], 2, []).exact).toBe(false);
    });
});
