import { foundry } from "viem/chains";
import { describe, expect, it, vi } from "vitest";
import { TournamentBondSection } from "../../../src/components/tournament/TournamentBondSection";
import {
    createCommitment,
    createJoinBond,
    createTournament,
} from "../../../src/stories/prt";
import { fireEvent, render, screen, waitFor, within } from "../../test-utils";

vi.mock("wagmi", async () => {
    const actual = await vi.importActual("wagmi");
    return { ...actual, useConfig: () => ({ chains: [foundry] }) };
});

vi.mock("../../../src/components/bond/BondRecoveryAction", () => ({
    BondRecoveryAction: () => <button type="button">Recover bond</button>,
}));

const commitment = createCommitment();
const bondPool = (balance: bigint) => ({
    balance,
    bondValue: 21_000_000_000_000_000n,
    bonds: [createJoinBond(commitment)],
});
const settled = (disposition: "RECOVERABLE" | "RECOVERED" | "NO_WINNER") =>
    createTournament({
        snapshot: {
            standing:
                disposition === "NO_WINNER" ? "ROOT_FAILED" : "ROOT_WINNER",
            bondRecovery: {
                disposition,
                claimer:
                    disposition === "RECOVERABLE"
                        ? "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
                        : null,
                payment:
                    disposition === "RECOVERABLE"
                        ? 21_000_000_000_000_000n
                        : null,
            },
        },
    });
const header = () => screen.getByRole("button", { name: /Bond/ });

describe("TournamentBondSection", () => {
    it("should start collapsed on the bar and balance while running", () => {
        render(
            <TournamentBondSection
                bondEvents={[]}
                bondPool={bondPool(20_000_000_000_000_000n)}
                joins={1}
                tournament={createTournament()}
            />,
        );

        expect(header()).toHaveAttribute("aria-expanded", "false");
        expect(
            within(header()).getByLabelText("Where the bonds went"),
        ).toBeInTheDocument();
        expect(within(header()).getByText("0.02 ETH")).toBeInTheDocument();
        expect(screen.getByText("Deposited")).not.toBeVisible();
    });

    it("should expand to every bond row and hide the summary", async () => {
        render(
            <TournamentBondSection
                bondEvents={[]}
                bondPool={bondPool(20_000_000_000_000_000n)}
                joins={1}
                tournament={createTournament()}
            />,
        );

        fireEvent.click(header());

        expect(header()).toHaveAttribute("aria-expanded", "true");
        expect(
            within(header()).queryByText("0.02 ETH"),
        ).not.toBeInTheDocument();
        await waitFor(() =>
            expect(screen.getByText("Deposited")).toBeVisible(),
        );
    });

    it("should offer the recovery from the summary, not the balance", () => {
        render(
            <TournamentBondSection
                bondEvents={[]}
                bondPool={bondPool(21_000_000_000_000_000n)}
                joins={1}
                tournament={settled("RECOVERABLE")}
            />,
        );

        expect(within(header()).getByText("recoverable")).toBeInTheDocument();
        expect(
            within(header()).queryByText("0.021 ETH"),
        ).not.toBeInTheDocument();
        expect(
            screen.getAllByRole("button", { name: "Recover bond" }),
        ).toHaveLength(1);
    });

    it("should move the recovery to the unclaimed payment once expanded", async () => {
        render(
            <TournamentBondSection
                bondEvents={[]}
                bondPool={bondPool(21_000_000_000_000_000n)}
                joins={1}
                tournament={settled("RECOVERABLE")}
            />,
        );

        fireEvent.click(header());

        await waitFor(() =>
            expect(screen.getByText("Unclaimed payment")).toBeVisible(),
        );
        expect(
            screen.getAllByRole("button", { name: "Recover bond" }),
        ).toHaveLength(1);
    });

    it("should leave out an empty balance", () => {
        render(
            <TournamentBondSection
                bondEvents={[]}
                bondPool={bondPool(0n)}
                joins={1}
                tournament={settled("RECOVERED")}
            />,
        );

        expect(within(header()).getByText("recovered")).toBeInTheDocument();
        expect(within(header()).queryByText("0 ETH")).not.toBeInTheDocument();
    });

    it("should keep a locked balance in the summary without a winner", () => {
        render(
            <TournamentBondSection
                bondEvents={[]}
                bondPool={bondPool(39_500_000_000_000_000n)}
                joins={1}
                tournament={settled("NO_WINNER")}
            />,
        );

        expect(within(header()).getByText("no winner")).toBeInTheDocument();
        expect(within(header()).getByText("0.0395 ETH")).toBeInTheDocument();
    });
});
