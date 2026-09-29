import { foundry } from "viem/chains";
import { describe, expect, it, vi } from "vitest";
import { BondRecoveryDetails } from "../../../src/components/bond/BondRecoveryDetails";
import type { BondRecoveredEvent } from "../../../src/lib/bondUtils";
import { createBondEvent } from "../../../src/stories/prt";
import { render, screen } from "../../test-utils";

vi.mock("wagmi", async () => {
    const actual = await vi.importActual("wagmi");
    return { ...actual, useConfig: () => ({ chains: [foundry] }) };
});

const claimer = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

describe("BondRecoveryDetails", () => {
    it("should show the unclaimed payment of a recoverable bond", () => {
        render(
            <BondRecoveryDetails
                bondRecovery={{
                    disposition: "RECOVERABLE",
                    claimer,
                    payment: 250_000_000_000_000_000n,
                }}
            />,
        );

        expect(screen.getByText("recoverable")).toBeInTheDocument();
        expect(screen.getByText("0.25 ETH")).toBeInTheDocument();
    });

    it("should show a present zero payment", () => {
        render(
            <BondRecoveryDetails
                bondRecovery={{
                    disposition: "RECOVERABLE",
                    claimer,
                    payment: 0n,
                }}
            />,
        );

        expect(screen.getByText("0 ETH")).toBeInTheDocument();
    });

    it("should split the recovered bond into paid and burned", () => {
        render(
            <BondRecoveryDetails
                bondRecovery={{
                    disposition: "RECOVERED",
                    claimer: null,
                    payment: null,
                }}
                recovery={
                    createBondEvent({
                        type: "BOND_RECOVERED",
                        refund: null,
                        recovery: {
                            commitment:
                                "0x725e9d3febbdd79841345f187aacf343ee497214277f3cb330aca90319cbdd92",
                            claimer,
                            payment: 200_000_000_000_000_000n,
                            burned: 50_000_000_000_000_000n,
                        },
                    }) as BondRecoveredEvent
                }
            />,
        );

        expect(screen.getByText("recovered")).toBeInTheDocument();
        expect(screen.getByText("0.2 ETH")).toBeInTheDocument();
        expect(screen.getByText("0.05 ETH")).toBeInTheDocument();
    });

    it("should render nothing while the tournament runs", () => {
        render(
            <BondRecoveryDetails
                bondRecovery={{
                    disposition: "TOURNAMENT_RUNNING",
                    claimer: null,
                    payment: null,
                }}
            />,
        );

        expect(screen.queryByText("Status")).not.toBeInTheDocument();
    });

    it("should explain that a balance without winner stays locked", () => {
        render(
            <BondRecoveryDetails
                bondRecovery={{
                    disposition: "NO_WINNER",
                    claimer: null,
                    payment: null,
                }}
            />,
        );

        expect(screen.getByText("no winner")).toBeInTheDocument();
        expect(
            screen.getByLabelText(
                "The tournament finished without a winner. Its balance stays locked in the contract; it is not burned.",
            ),
        ).toBeInTheDocument();
    });
});
