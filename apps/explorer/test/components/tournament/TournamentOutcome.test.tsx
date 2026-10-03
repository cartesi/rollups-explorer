import { keccak256, toHex } from "viem";
import { describe, expect, it } from "vitest";
import { TournamentOutcome } from "../../../src/components/tournament/TournamentOutcome";
import { createTournamentSnapshot } from "../../../src/stories/prt";
import { render, screen } from "../../test-utils";

const commitment = keccak256(toHex(1));

describe("TournamentOutcome", () => {
    it("should display the standing and the snapshot block", () => {
        render(
            <TournamentOutcome
                snapshot={createTournamentSnapshot({ asOfBlock: 42n })}
            />,
        );

        expect(screen.getByText("matches active")).toBeInTheDocument();
        expect(screen.getByText("as of block 42")).toBeInTheDocument();
    });

    it("should display a provisional inner winner with its expiry", () => {
        render(
            <TournamentOutcome
                snapshot={createTournamentSnapshot({
                    standing: "INNER_WINNER",
                    candidate: commitment,
                    winnerCommitment: commitment,
                    winnerExpiresAt: 250n,
                })}
            />,
        );

        expect(screen.getByText("provisional winner")).toBeInTheDocument();
        expect(screen.getByText("expires at block 250")).toBeInTheDocument();
    });

    it("should display no winner for a root tournament without a winner", () => {
        render(
            <TournamentOutcome
                snapshot={createTournamentSnapshot({ standing: "ROOT_FAILED" })}
            />,
        );

        expect(screen.getByText("no winner")).toBeInTheDocument();
        expect(screen.getByText("No winner")).toBeInTheDocument();
        expect(
            screen.getByLabelText(
                "The root tournament finished without a winner. It does not prove that any commitment was wrong.",
            ),
        ).toBeInTheDocument();
    });

    it("should show the pending candidate", () => {
        render(
            <TournamentOutcome
                snapshot={createTournamentSnapshot({
                    standing: "AWAITING_CLOSURE",
                    candidate: commitment,
                })}
            />,
        );

        expect(screen.getByText("candidate")).toBeInTheDocument();
    });
});
