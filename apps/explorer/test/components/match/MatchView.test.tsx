import { foundry } from "viem/chains";
import { describe, expect, it, vi } from "vitest";
import { MatchView } from "../../../src/components/match/MatchView";
import {
    createCommitment,
    createJoinBond,
    createMatch,
    createMatchAdvanced,
    createRefunds,
    createTournament,
} from "../../../src/stories/prt";
import { render, screen } from "../../test-utils";

vi.mock("wagmi", async () => {
    const actual = await vi.importActual("wagmi");
    return { ...actual, useConfig: () => ({ chains: [foundry] }) };
});

const depositor = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const otherAccount = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
const tournament = createTournament();
const match = createMatch();
const commitments = [
    createCommitment({
        commitment: match.commitmentOne,
        submitterAddress: depositor,
    }),
    createCommitment({
        commitment: match.commitmentTwo,
        submitterAddress: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    }),
];
const advances = [
    createMatchAdvanced({
        txHash: "0x7b39d1c90850f72daa51599ec1ff041aa5b1eda8f6ef1d00ce853b8f89462002",
    }),
    createMatchAdvanced({
        txHash: "0x89f986df6290a9157862849a6a0b92df8b170bcaca15a7c4ac8ba15886d53bd3",
        logIndex: 1n,
    }),
];

describe("MatchView", () => {
    it("should show the depositor of each claim bond", () => {
        render(
            <MatchView
                advances={[]}
                commitments={commitments}
                joinBonds={
                    new Map([
                        [match.commitmentOne, createJoinBond(commitments[0])],
                    ])
                }
                match={match}
                now={Date.now()}
                tournament={tournament}
            />,
        );

        expect(screen.getByText("Bonds")).toBeInTheDocument();
        expect(screen.getAllByText("Depositor")).toHaveLength(2);
        expect(screen.getByText("0.021 ETH")).toBeInTheDocument();
    });

    it("should tell refunds sent by depositors from other accounts", () => {
        render(
            <MatchView
                advances={advances}
                commitments={commitments}
                match={match}
                now={Date.now()}
                refunds={createRefunds(
                    advances.map(({ txHash }) => txHash),
                    0,
                    [depositor, otherAccount],
                )}
                tournament={tournament}
            />,
        );

        expect(screen.getByText("depositor")).toBeInTheDocument();
        expect(screen.getByText("other account")).toBeInTheDocument();
    });

    it("should leave out the bonds without commitments", () => {
        render(
            <MatchView
                advances={[]}
                match={match}
                now={Date.now()}
                tournament={tournament}
            />,
        );

        expect(screen.queryByText("Bonds")).not.toBeInTheDocument();
    });
});
