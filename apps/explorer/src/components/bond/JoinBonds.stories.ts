import type { Meta, StoryObj } from "@storybook/nextjs";
import { keccak256, toHex } from "viem";
import { createCommitment, createJoinBond } from "../../stories/prt";
import { JoinBonds } from "./JoinBonds";

const meta = {
    title: "Components/Bond/JoinBonds",
    component: JoinBonds,
    tags: ["autodocs"],
} satisfies Meta<typeof JoinBonds>;

export default meta;
type Story = StoryObj<typeof meta>;

const commitments = [
    createCommitment({
        commitment: keccak256(toHex("claim-one")),
        submitterAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        txHash: keccak256(toHex("join-one")),
    }),
    createCommitment({
        commitment: keccak256(toHex("claim-two")),
        submitterAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        txHash: keccak256(toHex("join-two")),
    }),
];

const bonds = (...overrides: Parameters<typeof createJoinBond>[1][]) =>
    new Map(
        commitments.map((commitment, index) => [
            commitment.commitment,
            createJoinBond(commitment, overrides[index]),
        ]),
    );

/**
 * Both claims joined directly, so the exact bond is read from each join
 * transaction.
 */
export const Exact: Story = {
    args: { commitments, bonds: bonds() },
};

/**
 * The second claim joined through another contract, such as a multisig, so
 * only the minimum bond is known.
 */
export const AtLeast: Story = {
    args: { commitments, bonds: bonds({}, { exact: false }) },
};

/**
 * The first claim sent more than the bond value. The contract keeps the
 * excess in the tournament balance.
 */
export const Overpaid: Story = {
    args: {
        commitments,
        bonds: bonds({ value: 25_000_000_000_000_000n }),
    },
};

/**
 * One account deposited the bonds of both claims.
 */
export const SameDepositor: Story = {
    args: {
        commitments: commitments.map((commitment) => ({
            ...commitment,
            submitterAddress: commitments[0].submitterAddress,
        })),
        bonds: bonds(),
    },
};

/**
 * The depositors are known from the commitments while the amounts load.
 */
export const Loading: Story = {
    args: { commitments, loading: true },
};
