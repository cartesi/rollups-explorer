import { keccak256, toHex } from "viem";
import { foundry } from "viem/chains";
import { describe, expect, it, vi } from "vitest";
import { JoinBonds } from "../../../src/components/bond/JoinBonds";
import { createCommitment, createJoinBond } from "../../../src/stories/prt";
import { render, screen } from "../../test-utils";

vi.mock("wagmi", async () => {
    const actual = await vi.importActual("wagmi");
    return { ...actual, useConfig: () => ({ chains: [foundry] }) };
});

const commitment = createCommitment({
    commitment: keccak256(toHex("claim")),
    submitterAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
});

describe("JoinBonds", () => {
    it("should show the depositor and the exact bond", () => {
        render(
            <JoinBonds
                commitments={[commitment]}
                bonds={
                    new Map([
                        [commitment.commitment, createJoinBond(commitment)],
                    ])
                }
            />,
        );

        expect(screen.getByText("Depositor")).toBeInTheDocument();
        expect(screen.getByText("0x709979...dc79C8")).toBeInTheDocument();
        expect(screen.getByText("0.021 ETH")).toBeInTheDocument();
    });

    it("should show a relayed join as at least the bond value", () => {
        render(
            <JoinBonds
                commitments={[commitment]}
                bonds={
                    new Map([
                        [
                            commitment.commitment,
                            createJoinBond(commitment, { exact: false }),
                        ],
                    ])
                }
            />,
        );

        expect(screen.getByText("at least 0.021 ETH")).toBeInTheDocument();
        expect(
            screen.getByLabelText(/went through another contract/),
        ).toBeInTheDocument();
    });

    it("should show a skeleton while the bond loads", () => {
        render(<JoinBonds commitments={[commitment]} loading />);

        expect(screen.getByText("Depositor")).toBeInTheDocument();
        expect(screen.getByTestId("join-bond-loading")).toBeInTheDocument();
    });
});
