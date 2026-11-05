import { keccak256, toHex } from "viem";
import { describe, expect, it } from "vitest";
import { TournamentOutcome } from "../../../src/components/tournament/TournamentOutcome";
import { createMatch, createTournament } from "../../../src/stories/prt";
import { render, screen } from "../../test-utils";

const commitment = keccak256(toHex(1));

describe("TournamentOutcome", () => {
    it("should display the standing and the snapshot block", () => {
        render(
            <TournamentOutcome
                tournament={createTournament({ snapshot: { asOfBlock: 42n } })}
            />,
        );

        expect(screen.getByText("matches active")).toBeInTheDocument();
        expect(screen.getByText("as of block 42")).toBeInTheDocument();
        expect(screen.queryByText("Contested states")).not.toBeInTheDocument();
    });

    it("should display a provisional inner winner with its expiry", () => {
        render(
            <TournamentOutcome
                tournament={createTournament({
                    snapshot: {
                        standing: "INNER_WINNER",
                        candidate: commitment,
                        winnerCommitment: commitment,
                        winnerExpiresAt: 250n,
                    },
                })}
            />,
        );

        expect(screen.getByText("provisional winner")).toBeInTheDocument();
        expect(screen.getByText("expires at block 250")).toBeInTheDocument();
    });

    it("should display no winner for a root tournament without a winner", () => {
        render(
            <TournamentOutcome
                tournament={createTournament({
                    snapshot: { standing: "ROOT_FAILED" },
                })}
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
                tournament={createTournament({
                    snapshot: {
                        standing: "AWAITING_CLOSURE",
                        candidate: commitment,
                    },
                })}
            />,
        );

        expect(screen.getByText("candidate")).toBeInTheDocument();
    });

    it("should list the contested states with the side the winner defends", () => {
        const contestedFinalStateOne = keccak256(toHex("state-one"));
        const contestedFinalStateTwo = keccak256(toHex("state-two"));
        render(
            <TournamentOutcome
                parentMatch={createMatch({
                    commitmentOne: keccak256(toHex("parent-one")),
                    commitmentTwo: keccak256(toHex("parent-two")),
                })}
                tournament={createTournament({
                    level: 1n,
                    contestedFinalStateOne,
                    contestedFinalStateTwo,
                    snapshot: {
                        standing: "INNER_WINNER",
                        candidate: commitment,
                        winnerCommitment: commitment,
                        finalStateHash: contestedFinalStateTwo,
                        winnerExpiresAt: 250n,
                    },
                })}
            />,
        );

        expect(screen.getByText("Contested states")).toBeInTheDocument();
        expect(screen.getAllByText("claims")).toHaveLength(2);
        expect(screen.getByText("defended by the winner")).toBeInTheDocument();
    });
});
