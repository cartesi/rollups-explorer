import { describe, expect, it, vi } from "vitest";
import { TournamentView } from "../../../src/components/tournament/TournamentView";
import { createTournament } from "../../../src/stories/prt";
import { render, screen } from "../../test-utils";

vi.mock("next/navigation", () => ({
    usePathname: () => "/tournament",
    useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("../../../src/components/bond/BondRecoveryAction", () => ({
    BondRecoveryAction: () => <button type="button">Recover bond</button>,
}));

describe("TournamentView", () => {
    it("should show the details and titled sections", () => {
        render(
            <TournamentView
                commitments={[]}
                matches={[]}
                tournament={createTournament()}
            />,
        );

        expect(screen.getByText("Level")).toBeInTheDocument();
        expect(screen.getByText("Standing")).toBeInTheDocument();
        expect(screen.getByText("Matches")).toBeInTheDocument();
        expect(screen.getByText("Bond events")).toBeInTheDocument();
    });

    it("should leave out the bond section while the tournament runs", () => {
        render(
            <TournamentView
                commitments={[]}
                matches={[]}
                tournament={createTournament()}
            />,
        );

        expect(screen.queryByText("Bond")).not.toBeInTheDocument();
    });

    it("should show the bond section once the bond can be recovered", () => {
        render(
            <TournamentView
                commitments={[]}
                matches={[]}
                tournament={createTournament({
                    snapshot: {
                        standing: "ROOT_WINNER",
                        bondRecovery: {
                            disposition: "RECOVERABLE",
                            claimer:
                                "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                            payment: 250_000_000_000_000_000n,
                        },
                    },
                })}
            />,
        );

        expect(screen.getByText("Bond")).toBeInTheDocument();
        expect(screen.getByText("recoverable")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Recover bond" }),
        ).toBeInTheDocument();
    });
});
