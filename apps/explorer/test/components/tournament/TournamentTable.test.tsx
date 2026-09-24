import { keccak256, toHex } from "viem";
import { describe, expect, it, vi } from "vitest";
import { TournamentTable } from "../../../src/components/tournament/TournamentTable";
import { createMatch } from "../../../src/stories/prt";
import { render, screen } from "../../test-utils";

vi.mock("next/navigation", () => ({
    usePathname: () => "/tournament",
    useRouter: () => ({ push: vi.fn() }),
}));

const claim = (i: number) => keccak256(toHex(i));

describe("TournamentTable", () => {
    it("should place rematches of winners into later rounds", () => {
        render(
            <TournamentTable
                matches={[
                    createMatch({
                        commitmentOne: claim(0),
                        commitmentTwo: claim(1),
                        winnerCommitment: "ONE",
                        deletionReason: "STEP",
                    }),
                    createMatch({
                        commitmentOne: claim(2),
                        commitmentTwo: claim(0),
                        blockNumber: 2n,
                    }),
                ]}
            />,
        );

        expect(screen.getByText("Round 1")).toBeInTheDocument();
        expect(screen.getByText("Round 2")).toBeInTheDocument();
    });

    it("should show the candidate waiting for an opponent", () => {
        render(<TournamentTable matches={[]} candidate={claim(9)} />);

        expect(screen.getByText("Round 1")).toBeInTheDocument();
        expect(
            screen.getByText(new RegExp(`^${claim(9).slice(0, 6)}`)),
        ).toBeInTheDocument();
    });

    it("should render no rounds without matches or candidate", () => {
        render(<TournamentTable matches={[]} candidate={null} />);

        expect(screen.queryByText("Round 1")).not.toBeInTheDocument();
    });
});
